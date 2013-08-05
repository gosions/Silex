//////////////////////////////////////////////////
// Silex, live web creation
// http://projects.silexlabs.org/?/silex/
// 
// Copyright (c) 2012 Silex Labs
// http://www.silexlabs.org/
// 
// Silex is available under the GPL license
// http://www.silexlabs.org/silex/silex-licensing/
//////////////////////////////////////////////////

goog.provide('silex.model.Component');

/**
 * @constructor
 */
silex.model.Component = function(element, opt_context){
	this.isEditable = false;
	// store a reference to the editable component
	this.element = this.getFirstEditableParent(element);
	// store component type
	this.type = silex.model.Component.getType(this.element);
	// default value for context
	if (opt_context == null) 
		opt_context = silex.model.Component.CONTEXT_NORMAL;
	// apply the style for the context
	this.setContext(opt_context);
}
/**
 * contexts of an element
 */
silex.model.Component.CONTEXT_NORMAL='normal';
silex.model.Component.CONTEXT_HOVER='hover';
silex.model.Component.CONTEXT_PRESSED='pressed';
/**
 * constant for silex element type
 */
silex.model.Component.ELEMENT_TYPE_CONTAINER = 'container';
/**
 * constant for silex element type
 */
silex.model.Component.ELEMENT_TYPE_ELEMENT = 'element';
/**
 * constant for silex element type
 */
silex.model.Component.ELEMENT_SUBTYPE_IMAGE = 'image';
/**
 * constant for silex element type
 */
silex.model.Component.ELEMENT_SUBTYPE_TEXT = 'text';
/**
 * element 
 */
silex.model.Component.prototype.element;
/**
 * context 
 */
silex.model.Component.prototype.context;
/**
 * type
 */
silex.model.Component.getType = function (element){
	var type = element.getAttribute('data-silex-type');
	var subType = element.getAttribute('data-silex-sub-type');
	switch(type){
		case silex.model.Component.ELEMENT_TYPE_CONTAINER:
			return type;
		case silex.model.Component.ELEMENT_TYPE_ELEMENT:
			return subType;
	}
	throw('Could not determine the type of this element.');
}
/**
 * context getter/setter
 */
silex.model.Component.prototype.getContext = function (){
	return this.context;
}
/**
 * context getter/setter
 */
silex.model.Component.prototype.setContext = function (context){
	this.context = context;
	this.setStyle(this.getStyle(context), context);
}
/**
 * style
 */
silex.model.Component.prototype.getStyle = function (opt_context){
	// default value for the state
	if (opt_context == null){
		opt_context = this.context;
	}
	// retrieve the element style
	var styleStr = this.element.getAttribute('data-style-'+opt_context);
	if (styleStr == null){
		//styleStr = '';
		return null;
	}
	// parse the style string
	var style = silex.Helper.stringToStyle(styleStr);
	// remove the position and size values
	style.top = null;
	style.left = null;
	style.width = null;
	style.height = null;
	style.position = null;
	// return the style
	return style;
}
/**
 * style
 */
silex.model.Component.prototype.setStyle = function (style, opt_context){
	if (style == null){
		// case of stage?
		return;
	}
	// default value for the state
	if (opt_context == null){
		opt_context = this.context;
	}
	var styleStr = '';
	goog.object.forEach(style, function(val, index, obj) {
		if (val){
			// apply to the view
			this.element.style[index] = val;

			//build the string
			styleStr += goog.string.toSelectorCase(index) + ': ' + val + '; ';
		}
	}, this);
	// add the bounding box if needed
	if (opt_context == silex.model.Component.CONTEXT_NORMAL){
		var bb = this.getBoundingBox();
		styleStr += 'top: '+bb.top+'; ';
		styleStr += 'left: '+bb.left+'; ';
		styleStr += 'width: '+bb.width+'; ';
		styleStr += 'height: '+bb.height+'; ';
		styleStr += 'position: absolute; ';
	}
	// store in the model
	this.element.setAttribute('data-style-'+opt_context, styleStr);
}
/**
 * bounding box 
 * key/value pairs of string with unit, e.g. '5px'
 */
silex.model.Component.prototype.getBoundingBox = function (){
	return {
		top: this.element.style.top,
		left: this.element.style.left,
		width: this.element.style.width,
		height: this.element.style.height
	};
}
/**
 * bounding box 
 * key/value pairs of string with unit, e.g. '5px'
 */
silex.model.Component.prototype.setBoundingBox = function (boundingBox){
	// change the view, move/resize the dom element
	this.element.style.top = boundingBox.top;
	this.element.style.left = boundingBox.left;
	this.element.style.width = boundingBox.width;
	this.element.style.height = boundingBox.height;
	// get the data-style-normal attribute
	var styleStr = this.element.getAttribute('data-style-'+silex.model.Component.CONTEXT_NORMAL);
	if (styleStr == null){
		styleStr = '';
	}
	// convert to style object
	var style = silex.Helper.stringToStyle(styleStr);
	// update the model
	style.top = boundingBox.top;
	style.left = boundingBox.left;
	style.width = boundingBox.width;
	style.height = boundingBox.height;
	// build a string out of the style object
	var styleStr = silex.Helper.styleToString(style);
	// store it in the data-style-normal attribute
	this.element.setAttribute('data-style-'+silex.model.Component.CONTEXT_NORMAL, styleStr);
}
/**
 * image source
 */
silex.model.Component.prototype.getImageSrc = function (){
	if (this.type == silex.model.Component.ELEMENT_SUBTYPE_IMAGE){
		var img = goog.dom.getElementsByTagNameAndClass('img', null, this.element)[0];
		if (img != null){
			return img.getAttribute('src');
		}
		else{
			console.error('The image element inside the component could not be found. Canot get the source.');
		}
	}
	else{
		console.error('The component is not an image, canot get the source.');
	}
	return '';
}
/**
 * image source
 */
silex.model.Component.prototype.setImageSrc = function (url){
	if (this.type == silex.model.Component.ELEMENT_SUBTYPE_IMAGE){
		var img = goog.dom.getElementsByTagNameAndClass('img', null, this.element)[0];
		if (img != null){
			return img.setAttribute('src', url);
		}
		else{
			console.error('The image element inside the component could not be found. Canot set the source.');
		}
	}
	else{
		console.error('The component is not an image, canot set the source.');
	}
}
/**
 * get raw html content
 */
silex.model.Component.prototype.getHtml = function (opt_baseUrl){
	console.log('getHtml');
	// apply the data-style-normal to all nodes
	this.applyStateToAllComponents('normal');

	// unregister jquery plugin
	this.setEditable(false);

	// remove all markup linked to the "editable" jquery plugin
	var cleanContainer = this.element.cloneNode(true);

	// register jquery plugin
	this.setEditable(true);

	// relative URLs when possible
	if (opt_baseUrl){
		this.absolute2relative(opt_baseUrl, cleanContainer);
	}

	// return the html content
	return cleanContainer.innerHTML;
}
/**
 * set html content
 * make it editable and with absolute urls
 */
silex.model.Component.prototype.setHtml = function (html, opt_baseUrl){
	console.log('setHtml '+html);
	// unregister jquery plugin
	this.setEditable(false);
	// set the html content
	this.element.innerHTML = html;
	// absolute URLs when possible
	if (opt_baseUrl){
		this.relative2absolute(opt_baseUrl);
	}
	// restore editing
	this.setEditable(true);
}
/**
 * find the first editable parent
 */
silex.model.Component.prototype.getFirstEditableParent = function(element){
	var child = element;
	// go through all parents untill it is editable
	while (child && child.getAttribute && !this.getEditable(child)){
		child = child.parentNode;
	}
	// return the first editable element
	if (child && child.getAttribute && this.getEditable(child)){
		return child;
	}
	else{
		console.warn('The component has no editable parent.');
	}
	return element;
}
/**
 * init or remove the editable jquery plugin
 * if opt_element element to set as editable, optional, this.element is default
 */
silex.model.Component.prototype.getEditable = function(opt_element){
	// default value for the element
	if (opt_element == null){
		opt_element = this.element;
	}
	return $(opt_element).hasClass('editable-style');
}
/**
 * init or remove the editable jquery plugin
 * if opt_element element to set as editable, optional, this.element is default
 */
silex.model.Component.prototype.setEditable = function(isEditable, opt_element){
	console.log('setEditable '+isEditable);
	console.log(opt_element);
	// default value for the element
	if (opt_element == null){
		opt_element = this.element;
	}
	console.log(opt_element);
	// activate editable plugin
	if (isEditable){
		$('.editable-style[data-silex-type="container"]', opt_element).each(function(){
			$(this).editable({
				isContainer: true
			});
		});
		$('.editable-style[data-silex-type="element"]', opt_element).editable();

		// the root element (is not editable when it is the stage, i.e. has no css class 'editable-style')
		if (this.getEditable(opt_element)){
			var type = opt_element.getAttribute('data-silex-type');
			if (type==silex.model.Component.ELEMENT_TYPE_CONTAINER){
				$(opt_element).editable({
					isContainer: true
				});
			}
			else{
				$(opt_element).editable();
			}
		}
	}
	// deactivate editable plugin
	else{
		$('[data-silex-type="container"]', opt_element).editable('destroy');
	    $('[data-silex-type="element"]', opt_element).editable('destroy');
	
		// the root element (is not editable when it is the stage, i.e. has no css class 'editable-style')
		if (this.getEditable(opt_element)){
			$(opt_element).editable('destroy');
		}

		// cleanup the dom
		$(opt_element).find('.ui-resizable').removeClass('ui-resizable');
		$(opt_element).find('.ui-draggable').removeClass('ui-draggable');
		$(opt_element).find('.ui-droppable').removeClass('ui-droppable');
		$(opt_element).find('[aria-disabled]').removeAttr('aria-disabled');
		$(opt_element).find('.ui-resizable-handle').remove();
	}
	this.isEditable = isEditable;
}
/**
 * Browse the children and convert all URLs to relative when possible
 */
silex.model.Component.prototype.absolute2relative = function (baseUrl, opt_element) {
	console.log('absolute2relative '+baseUrl);
	if (baseUrl==null){
		throw ('The base URL is needed in order to convert paths to relative');
	}
	if (opt_element==null){
		opt_element = this.element;
	}
	// convert absolute to relative paths
	$(opt_element).find('[src],[href]').each(function () {
		// attribute can be src or href
		var attr = 'src';
		var value = this.getAttribute(attr);
		if (value==null){
			attr = 'href';
			value = this.getAttribute(attr);
		}
// to do, do not work with file picker
//console.warn('Conversion to relative url is turned off because of the file picker');
		this.setAttribute(attr, silex.Helper.getRelativePath(value, baseUrl));
	});
}
/**
 * Browse the children and convert all URLs to absolute
 */
silex.model.Component.prototype.relative2absolute = function (baseUrl, opt_element) {
	console.log('relative2absolute '+baseUrl);
	if (opt_element==null){
		opt_element = this.element;
	}
	// convert absolute to relative paths
	$(this.element).find('[src],[href]').each(function () {
		// attribute can be src or href
		var attr = 'src';
		var value = this.getAttribute(attr);
		if (value==null){
			attr = 'href';
			value = this.getAttribute(attr);
		}

		this.setAttribute(attr, silex.Helper.getAbsolutePath(value, baseUrl));
	});
}
/**
 * apply a given state to all chlidren
 */
silex.model.Component.prototype.applyStateToAllComponents = function(state){
	// apply the data-style-normal or data-style-* to all nodes
	$('[data-style-normal]').each(function () {
		var styleStr = this.getAttribute('data-style-'+state);
		if (styleStr!=null)
			this.setAttribute('style', styleStr);
		else
			this.setAttribute('style', this.getAttribute('data-style-normal'));
	});
}
/**
 * component creation
 * create a DOM element, attach it to this container 
 * and returns a new component for the element
 */
silex.model.Component.prototype.addContainer = function(){
	if (this.type != silex.model.Component.ELEMENT_TYPE_CONTAINER){
		throw('Canot create a child component for this component because it is not of type '+silex.model.Component.ELEMENT_TYPE_CONTAINER);
	}
	// create the conatiner
	var div = goog.dom.createElement('div');
	div.className = 'editable-style';
	div.setAttribute('data-silex-type', silex.model.Component.ELEMENT_TYPE_CONTAINER)
	// attach it 
	var container = goog.dom.getElementsByClass('background', this.element)[0];
	goog.dom.appendChild(container, div);
	// make it editable
	this.setEditable(true, div);
	// set default style
	var style = {};
	style.position = 'absolute';
	style.left = '100px';
	style.top = '100px';
	style.height = '100px';
	style.width = '100px';
	style.backgroundColor = 'rgba(255, 255, 255, 1)';
	var component = new silex.model.Component(div);
	component.setStyle(style, silex.model.Component.CONTEXT_NORMAL);
	// return a component for this element
	return component;
}
/**
 * component creation
 * create a DOM element, attach it to this container 
 * and returns a new component for the element
 */
silex.model.Component.prototype.addText = function(){
	if (this.type != silex.model.Component.ELEMENT_TYPE_CONTAINER){
		throw('Canot create a child component for this component because it is not of type '+silex.model.Component.ELEMENT_TYPE_CONTAINER);
	}
	// create the element
	var div = goog.dom.createElement('div');
	div.className = 'editable-style';
	div.setAttribute('data-silex-type', silex.model.Component.ELEMENT_TYPE_ELEMENT)
	div.setAttribute('data-silex-sub-type', silex.model.Component.ELEMENT_SUBTYPE_TEXT)
	div.innerHTML = 'New text box';
	// attach it 
	var container = goog.dom.getElementsByClass('background', this.element)[0];
	goog.dom.appendChild(container, div);
	// make it editable
	this.setEditable(true, div);
	// set default style
	var style = {};
	style.position = 'absolute';
	style.left = '100px';
	style.top = '100px';
	style.height = '100px';
	style.width = '100px';
	style.backgroundColor = 'rgba(255, 255, 255, 1)';
	//style.overflow = 'hidden';
	var component = new silex.model.Component(div);
	component.setStyle(style, silex.model.Component.CONTEXT_NORMAL);
	// return a component for this element
	return component;
}
/**
 * component creation
 * create a DOM element, attach it to this container 
 * and returns a new component for the element
 */
silex.model.Component.prototype.addImage = function(url){
	console.log('addImage '+url);
	if (this.type != silex.model.Component.ELEMENT_TYPE_CONTAINER){
		throw('Canot create a child component for this component because it is not of type '+silex.model.Component.ELEMENT_TYPE_CONTAINER);
	}
	if (url == null){
		console.error('No URL provided for the image component');
	}
	var div = goog.dom.createElement('div');
	div.className = 'editable-style';
	div.setAttribute('data-silex-type', silex.model.Component.ELEMENT_TYPE_ELEMENT)
	div.setAttribute('data-silex-sub-type', silex.model.Component.ELEMENT_SUBTYPE_IMAGE)

	var img = goog.dom.createElement('img');
	img.style.width = '100%';
	img.style.height = '100%';
	img.setAttribute('src', url);

	// attach it all
	var container = goog.dom.getElementsByClass('background', this.element)[0];
	goog.dom.appendChild(container, div);
	goog.dom.appendChild(div, img);
	// make it editable
	this.setEditable(true, div);
	// set default style
	var style = {};
	style.position = 'absolute';
	style.left = '100px';
	style.top = '100px';
	var component = new silex.model.Component(div);
	component.setStyle(style, silex.model.Component.CONTEXT_NORMAL);
	img.onload = function (e){
		// set container size to match image size
		style.width = img.offsetWidth + 'px';
		style.height = img.offsetHeight + 'px';
		component.setStyle(style, silex.model.Component.CONTEXT_NORMAL);
	}
	// return a component for this element
	return component;
}
/**
 * remove elements
 */
silex.model.Component.prototype.remove = function(component){
	if (!goog.dom.contains(this.element, component.element)){
		throw('Canot remove this component because it is not my children.')
	}
	goog.dom.removeNode(component.element);
}
/**
 * link
 */
silex.model.Component.prototype.removeLink = function(){
	this.element.removeAttribute('data-silex-href');
}
/**
 * link
 */
silex.model.Component.prototype.setLink = function(url){
	this.element.setAttribute('data-silex-href', url);
}
/**
 * link
 */
silex.model.Component.prototype.getLink = function(){
	return this.element.getAttribute('data-silex-href');
}
/**
 * mark selection
 */
silex.model.Component.prototype.setSelected = function(isSelected){
//	var prop = null;
	if (isSelected){
		goog.dom.classes.add(this.element, 'silex-selected');
//		prop = '0 0 1px 1px rgba(0, 0, 0, .8), inset 0 0 1px 1px rgba(255, 255, 255, 0.8)';
	}
	else{
		goog.dom.classes.remove(this.element, 'silex-selected');
	}
//	this.element.style.boxShadow = prop;
//	this.element.style.MozBoxShadow = prop;
//	this.element.style.WebkitBoxShadow = prop;
}
/**
 * mark selection
 */
silex.model.Component.prototype.getSelected = function(){
	return goog.dom.classes.has(this.element, 'silex-selected');
}
