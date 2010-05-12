/*
---
description: Message Class. A much more sophisticated way to alert your users.

license: MIT-style

authors:
- Jason Beaudoin
- ColdFire Designs

requires:
	core/1.2.4: '*'
	more/1.2.4:Chain.Wait
	more/1.2.4:Element.Position
	more/1.2.4:Element.Shortcuts

provides: [Message.say, Message.tell, Message.ask, Message.waiter, Messate.tip]

...
*/

var Message = new Class({
	Implements: [Options, Events],
	msgChain: null,
	end: false,
	isDisplayed: false,
	windowSize: null,
	pageSize: null,
	page: $(document),
	box: null,
	boxSize: null,
	scrollPos: null,
	windowSize: null,
	hasVerticalBar: false,
	hasHorizontalBar: false,
	boxPos: $empty,
	tipCheck: true,
	cancel: false,
	fx: null,
	fxOut: null,
	options: {
		callingElement: null,
		top: false,
		left: false,
		centered: false,
		offset: 30, 				// determines how high the message is set when it fades in.
		width: 'auto',
		icon: null,					// your icon is expected to be 40 x 40
		iconPath: 'images/icons/',
		iconSize: 40,
		fontSize: 14,
		title: null,
		message: null,
		delay: 0,
		autoDismiss: true,
		dismissOnEvent: false,
		isUrgent: false,
		callback: null,				// send a function to be fired on confirmation.
		passEvent: null,			// passing an event will make this message appear the your cursor location.
		fxTransition: null,			// set your own transition.
		fxDuration: 'normal',		// set the transition duration
		fxUrgentTransition: Fx.Transitions.Bounce.easeOut, // set your own urgent transition
		fxOutTransition: null,		// set the out transition
		fxOutDuration: 'normal'		// se the out duration
	},
	
	initialize: function(options){
		this.setOptions(options);
		this.box = this;
		if(this.options.width == 'auto') this.options.width = '250px';
		
		if($chk(this.options.passEvent) && $defined(this.options.callingElement)) {
			this.options.dismissOnEvent = true;
			this.options.callingElement.addEvent('mouseout', function(){
				// Only call a dismiss action when if the message is already visible. Otherwise, cancel it.
				if(this.isDisplayed) this.dismiss(); else this.cancel = true;
			}.bind(this));	
		}
	},
	
	// Your standard message.
	say: function(title, message, icon, isUrgent, callback){		
		this.setVars(title, message, icon, isUrgent, callback);// Supporting the passing of vars. 		
		this.box = this.createBox();
		// We must instantiate a new instance of the chain class each time the "say" method is called to overwrite the existing one otherwise a buggy error occurs.
		this.msgChain = new Chain(); 
		this.setMsgChain();		
	},
	
	// Ask the user a question. This will bounce in to get their attention.
	ask: function(title, message, callback, icon, isUrgent){
		this.options.autoDismiss = false;
		if($chk(callback)) this.options.callback = callback; // ensure that autoDismiss is set to false and callback is set.
		isUrgent = $defined(isUrgent) ? isUrgent : true;
		this.say(title, message, icon, isUrgent, callback);
	},
	
	// Tell the user something, then make them acknowledge your message by pressing the 'OK' link.
	tell: function(title, message, icon, isUrgent){
		isUrgent = $defined(isUrgent) ? isUrgent : true;
		this.options.dismissOnEvent = true;
		this.say(title, message, icon, isUrgent);
	},
	
	// Our waiter method will tell the user to wait. You're code will need to dismiss upon some event.
	waiter: function(title, message, icon, isCentered){
		if($chk(isCentered)) this.options.centered = isCentered;
		this.options.autoDismiss 	= false;
		this.options.dismissOnEvent = true;
		this.options.centered 		= true;
		this.say(title, message, icon);
	},
	
	// Our tip method will create a tip on rollover.
	tip: function(title, message, icon){
		this.options.autoDismiss 	= true;
		this.options.dismissOnEvent = true;
		this.say(title, message, icon);

	},
	
	setVars: function(title, message, icon, isUrgent, callback){
		if($defined(title))		this.options.title = title;
		if($defined(message)) 	this.options.message = message;
		if($defined(icon))		this.options.icon = icon;
		if($defined(isUrgent))	this.options.isUrgent = isUrgent;
		if($defined(callback))	this.options.callback = callback;
	},
		
	// Creates the chain and sets it in motion...
	setMsgChain: function(){		
		
		if(!$chk(this.fx)){		
			// The simple fade in and out Fx. This initializes the native chain linking option and calls the chain after each transition completes.
			this.fx = new Fx.Tween(this.box, {
				link: 'chain',
				onComplete: function(){
					if((this.options.autoDismiss && !this.options.dismissOnEvent) || (!this.isDisplayed && !$chk(this.options.callback)) ) this.msgChain.callChain();
					//dbug.log((this.options.autoDismiss && !this.options.dismissOnEvent) || (!this.isDisplayed && !$chk(this.options.callback)));
				}.bind(this),
				transition: this.options.fxTransition,
				duration: this.options.fxDuration
			});
		}
		
		// Must set the wait time to 0 when it's urgent otherwise the message will not dismiss immediately when the user
		// clicks a dismissing link.
		var waitTime
		if($chk(this.options.callback) || this.options.autoDismiss == false || this.options.dismissOnEvent) waitTime = 0; else waitTime = 2000 ;
		
		// Shows the message, waits, then closes it.
		this.msgChain.wait(
			this.options.delay // option to delay showing the message
		).chain(
			function(){ 
				if(!this.cancel) this.showMsg(); else this.complete(); // destroys the message if it's been canceled.
			}.bind(this)
		).wait(
			waitTime // the default delay before hidding the message
		).chain(
			function(){
				this.hideMsg();
			}.bind(this)
		).callChain();
	},
		
	showMsg: function(){
		this.setSizes(); // set the dimensions of the page, window, message box and scroll position.
		this.setBoxPosition();
		
		// If the vertical scroll bar is hidden, ensure that one doesn't show up during this process.		
		if(this.hasVerticalBar) $(document.body).setStyle('overflow', 'hidden'); // doesn't work in IE, but will not cause any ill effects.
		
		this.box.setStyles({
			'opacity': 0,
			'top': this.boxPos.startTop,
			'left': this.boxPos.startLeft,
			'z-index': '1'
		}).fade('in');
		
		if(!this.options.isUrgent){			
			this.fx.start('top', this.boxPos.endTop);
			
		// Transition using the Bounce Fx if it's urgent.
		} else {
			
			var urgentFx = new Fx.Tween(this.box, {
				duration: 'long', 
				transition: this.options.fxUrgentTransition
			});
			
			urgentFx.start('top', this.boxPos.endTop);
			
		}
		
		this.isDisplayed = true; // A utility for the procedure. Storing a var that the message is currently being displayed.
	},
	
	dismiss: function(){
		this.msgChain.callChain();
	},
	
	// Determines where the message will be displayed.
	setBoxPosition: function(){
		this.boxPos = new Hash(); // Global positioning container.
		
		// Support for the top and left positioning. These variables overide other positioning settings like centering on urgency, and event/cursor positioning.
		var usePosition = (this.options.top && this.options.left);
		var startTopPos;
		var startLeftPos;
		var endLeftPos;
		var endTopPos;
		
		// Set the positioning. Default position is the bottom-right corner of the window (when top and left equal false).
		this.options.top  ? startTopPos  = (this.boxSize.y * -1) : startTopPos = this.scrollPos.y + this.windowSize.y;
		this.options.left ? startLeftPos = this.options.offset : startLeftPos = this.windowSize.x - this.boxSize.x - this.options.offset;
		this.options.top  ? endTopPos 	 = this.options.offset : endTopPos = this.scrollPos.y + this.windowSize.y - (this.boxSize.y * 1.25); 
		
		// If there was an event that was passed, show the message at the cursor coordinates...
		if(($chk(this.options.passEvent) && !this.options.isUrgent) && !usePosition){
			/* Ensure that the message doesn't fall outside of the viewable area. As the positioning of the message is determined by the cursor position,
			   the message box might be too large and it will fall too far to the right. If that happens, we put the message box to the left of the
			   cursor.*/
			var offsetCursor;
			(this.options.passEvent.page.x + this.boxSize.x > this.windowSize.x)? offsetCursor = (this.boxSize.x * -1) - 5 : offsetCursor = 5;
			
			this.boxPos.extend({
				startTop  : this.options.passEvent.page.y - this.options.offset,
				startLeft : this.options.passEvent.page.x + offsetCursor,
				endTop	  : this.options.passEvent.page.y
			});	
			
		// If the message is urgent or centered, displays the message in the center of the page...
		} else if((this.options.isUrgent && !usePosition) || this.options.centered) {
			this.box.position();
			this.boxPosition = this.box.getCoordinates();
			this.boxPos.extend({
				startTop  : this.boxPosition.top - 100,
				startLeft : this.boxPosition.left,
				endTop 	  : this.boxPosition.top
			});
			
		// Positions passed here...
		} else {
			this.boxPos.extend({
				startTop  : startTopPos,
				startLeft : startLeftPos,
				endTop 	  : endTopPos
			});			
		}
	},
	
	// Initialize variables that are used throughout the class
	setSizes: function(){
		this.boxSize     = this.box.getSize(); // Size of the message itself
		this.boxPosition = this.box.getCoordinates(); // Message position
		this.windowSize	 = this.page.getSize(); // Size of the visible window
		this.scrollPos 	 = this.page.getScroll(); // The scroll position... will only have a value if the page is larger than the window.
		this.pageSize 	 = this.page.getScrollSize(); // Size of the entire page.
		if(this.windowSize.y >= this.pageSize.y) this.hasVerticalBar = true || false
		if(this.windowSize.x >= this.pageSize.x) this.hasHorizontalBar = true || false
	},
	
	// Creates the message elements.
	createBox: function(){
		var newBox = new Element('div', {'class': 'msgBox', 'styles': {'max-width':this.options.width, 'width':this.options.width}});
		var imageSize = 0;
		if($chk(this.options.icon)) {
			var newIcon = new Element('div', {'class': 'msgBoxIcon'});
			var newImage = new Element('img', {
				'class': 'msgBoxImage',
				'src': this.options.iconPath + this.options.icon,
				'styles':{
					'width': this.options.iconSize,
					'height': this.options.iconSize
				}
			});
		}
		
		// If the title or the message vars are not set, get the content from the "rel" property of the expected passed calling element.
		if(!$chk(this.options.title) || !$chk(this.options.message)) this.getContent();
		
		var newContent = new Element('div', {
			'class': 'msgBoxContent'
		}).setStyle('font-size', this.options.fontSize);
		
		var newTitle = new Element('div', {
			'class': 'msgBoxTitle',
			'html': this.options.title
		}).setStyle('font-size', this.options.fontSize + 4);
		
		var imageWidth = this.getCSSTotalWidth('msgBoxIcon'); // Getting the size of the icon image (width + padding);
		
		var newClear = new Element('div', {'class': 'clear'}); 
		var p = new Element('p',{
			'html': this.options.message + '<br />',
			'styles': {
				'margin': '0px'	,
				'width': this.options.width.toInt() - imageWidth // ensures that the title and content fits nicely in the message box.
			}
		});
		
		// Detect if the message contains a form
		var isComment = this.options.message.indexOf('textarea') > -1;
		
		// Urgent messages with an callback param require a yes and a no link to dismiss the message
		if($chk(this.options.callback) && !isComment) {
			
			var yes = this.createLink('Yes', true);
			var no 	= this.createLink('No', false);
			
			yes.inject(p);
			p.appendText(' | ');
			no.inject(p);
			
		} else if(isComment){
			
			var sendLink 	= this.createLink('Send', true);			
			var cancelLink 	= this.createLink('Cancel', false);
			
			sendLink.inject(p);	
			p.appendText(' | ');
			cancelLink.inject(p);
			
		// Urgent messages that are for information only have an "ok" link to dismiss the message.
		} else if(this.options.isUrgent || (!this.options.autoDismiss && !this.options.dismissOnEvent)){
			
			var ok = this.createLink('Ok', false);
			ok.inject(p);

		}	
				
		var newMessage = new Element('div', {
			'class': 'msgBoxMessage'
		});
		
		// Putting the message box together.
		p.inject(newMessage);
		if($chk(this.options.icon)) { 
			newIcon.inject(newBox);
			newImage.inject(newIcon);
		}
		newContent.inject(newBox);
		newTitle.inject(newContent);
		newClear.inject(newContent);
		newMessage.inject(newContent);		
		newBox.inject(this.page.body);
		
		this.box = newBox;
		return newBox;
	},
	
	// Creates a user response link in the message that dismisses the window (i.e.: Ok, yes, no, etc.).
	createLink: function(html, callMe){
		var ourLink = new Element('a', {
			'href': 'javascript:',
			'class': 'msgBoxLink',
			'html': html,
			'events':{
				'click': function(){
					this.msgChain.callChain();
					if(callMe) this.executeCallback(); // Optional callback can be executed here.
				}.bind(this)
			}
		});
		return ourLink;
	},
	
	// UTILITIES BLOCK: utilities that are used internally by this class.
	
	// Gets the total size (width + padding) of a CSS class. Creates an element; injects it into the DOM; messures the element and destroys it.
	// Inserting an element into the DOM is the only way to messure it.
	getCSSTotalWidth: function(myClass){	
		var dummy = new Element('div', {'id': 'dummy', 'class': myClass});
		dummy.inject($(document.body));
		var size = dummy.getComputedSize();
		dummy.destroy();
		return size.totalWidth;
	},
	
	executeCallback: function(){
		// Determine if the callback is an object or a string to evaluate. It is expected that the object will have a click event.
		if($type(this.options.callback) == 'element') this.options.callback.fireEvent('click'); else eval(this.options.callback);
	},
	
	// Tip error catching... cuz it's easy to screw this up. Nice to be told that it's messed up.	
	getContent: function(){
		// Expecting a calling element.
		var title;
		var msg;
		if($defined(this.options.callingElement)){
			var rel = this.options.callingElement.getProperty('rel');
			var arr;
			if(!$chk(rel)){
				arr 	= this.setError("Expected data in the 'rel' property of this calling element was not defined.")
				title 	= arr[0];
				msg 	= arr[1];
				this.options.autoDismiss = false;
			} else {
				arr 	= rel.split('::');
				title 	= arr[0];
				msg 	= arr[1];
			}
		}
		this.options.title = title;
		this.options.message = msg;
	},
	
	setError: function(msg){
		var arr = new Array();
		arr.push("<span style='color:#FF0000'>Error!<\/span>");
		arr.push(msg);
		return arr;
	},
	
	complete: function(){
		this.box.destroy(); // Self destruct feature when it's all done.
		this.end = true; // Message status support (just in case you need it).
		this.isDisplayed = false;
		this.fireEvent('onComplete'); // If you've set an onComplete event during instantiation of the class, it will fire here.
		$(document.body).setStyle('overflow', 'auto');
	},
		
	hideMsg: function(){
		// Must set the overflow to hidden again here in case there is more than one message that is being shown!	
		if(this.hasVerticalBar) $(document.body).setStyle('overflow', 'hidden');
		var position = this.box.getCoordinates(); // Get the current position (will be different than the coordinates at the start of the procedure).
		this.box.fade('out');
		
		this.fxOut = new Fx.Tween(this.box, {
			transition: this.options.fxOutTransition,
			duration: this.options.fxOutDuration
		});
		
		this.fxOut.addEvent('complete', function(){
			this.complete(); // runs the onComplete event once the fx transition is fully complete.
		}.bind(this));
		
		var topPos;		
		this.options.top ? topPos = this.boxSize.y * -1 : topPos = position.top + this.boxSize.y;
		
		this.fxOut.start('top', topPos);
	}
});