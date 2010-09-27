Message Class
=============

This Message Class is a simple Mootools class that will send a message to the user in style! It’s much more elegant than what you could expect from the alert javascript method. 

![Screenshot](http://www.coldfiredesigns.com/2010/downloads/MessageClassScreenShot.jpg)

Some Key Features
-----------------

	* It fades in and fades out on it's own;
	* Force a response with the tell method;
	* Ask a user a question and execute a callback function on a "yes" click;
	* Position the message anywhere on the screen;
	* Use it as an input for comments... very useful!;
	* Style it the way you wish using CSS;
	* Make it as wide as you need (through the options);
	* Can be dismissed automatically, on an event, on a delay, etc
	* Much more!... check it out.


How to use
----------

All that you have to do is call the class, and as a minimum, you set three basic parameters:

	* the icon you want to use (40x40);
	* the title of your message;
	* the message itself

...then you execute your command:

	* say();
	* tell();
	* ask();
	* tip();
	* waiter();

Options
-------

	* callingElement: (element: default to null)
	* top: (boolean: defaults to false) Set the message to come out from the top edge of the window. Defaults to the bottom.
	* left: (boolean: defaults to false) Set the message to the left. Defaults to right.
	* centered: (boolean: defaults to false) Set the message to the center of the window.
	* offset: (integer: defaults to 30) Determines the padding to give from the edge of the window frame.
	* width: (mixed: defaults to 'auto') The CSS value of your message. Pass a number to change it.
	* iconPath: (string: defaults to 'image/icons/') The path of the icons that you'd like to use.
	* icon: (string: defaults to null) The file name of your icon image. Note: your icon is expected to be 40 x 40! Can be changed in the CSS.
	* title: (string: defaults to null) The title of your message.
	* message: (string: defaults to null) Your message.
	* delay: (integer: defaults to 0) Delays the display of your message. Integer is interpreted in milliseconds.
	* autoDismiss: (boolean: defaults to true) The message will dismiss on it's own.Note: this is shut off automatically when user input is needed.
	* dismissOnEvent: (boolean: defaults to false) The message will dismiss on the mouseout event. Note: this is used automatically when an event is passed.
	* isUrgent: (boolean: defaults to false) Use the "urgent" transitioning to get the user's attention. Note: this is automatically used on the ask and tell methods.
	* callback: (string: defaults to null) Send a function in the form of a string to be fired on confirmation of an ask method.
	* passEvent: (event: defaults to null) Passing an event will make the message appear the your cursor location (offset by 5 px).
	* tipMode: (boolean: defaults to false) Tip mode is a short-cut that sets the autoDismiss and dismissOnEvent to true.
	* stack: (Boolean: defaults to true) This stacks multiple messages on top of the previous messages (or under, depending on where you’ve put your message) instead of placing them over (as in using a z-index value). Setting it to false will use a z-index.
	* fxTransition: (Fx.Transition: defaults to null) Set your own transition. The default transition will simply fade in.
	* fxDuration: (mixed: defaults to 'normal') Set the transition duration. Intergers are interpreted in milliseconds.
	* fxUrgentTransition: (Fx.Transition object: defaults to Fx.Transitions.Bounce.easeOut) Set your own urgent transition
	* fxOutTransition:  (Fx.Transition object: defaults to null) Set the out transition. The default will simply fade out.
	* fxOutDuration: (mixed: defaults to 'normal') Set the transition duration. Intergers are interpreted in milliseconds.



Events
------

	* onShow: fires when the message shows
	* onComplete: fires when the message hides


Code Snippets
-------------


Say Method:

	#JS
	var saySimple = function(){
		new Message({ 	
			iconPath: "/images/",
			icon: "okMedium.png", 	
			title: "Success!", 		
			message: "You have successfully messaged your user." 
		}).say(); 
	}

**Note: tell method is the same, except instead of say(), you write tell().


Ask Method:

	#JS
	var askSimple = function(){ 
		new Message({     	    
			iconPath: "/images/", 
			icon: "mediumQuestion.png",  
			title: "Question!",     
			message: "Do you know the meaning of life?", 
			callback: "saySimple()"  	
		}).ask();  
	}



Creating a comment pop-up:

This is a bit more complex, but it shows you the flexibility. What I do here is create a comment box and after the user presses "Send", a confirmation message appears!



    #JS
	document.id('commentLink').addEvent('click', function(e){
		var obj = new Element('div', {
			'id': 'dummy',
			'events': {
				'click': function(){
					sendComment();
					this.destroy();
				}
			}
		});
		new Message({
			icon: "speakMedium.png",
			iconPath: "/2010/images/",
			width: 300,
			fontSize: 14,
			passEvent: e,
			autoDismiss: false,
			title: 'Have a Comment?' ,
			message: '<textarea id="commentText" cols="3" rows="5" class="msgEditable"></textarea>',
			callback: obj
		}).say();
	});
	var sendComment = function(){
		new Message({
			icon: "okMedium.png",
			iconPath: "/2010/images/",
			title: "Received!",
			message: "We've received your comments, and we'll ...uhhh... get back to you."
		}).say();
	}


Screenshots
-----------

![Screenshot 1](http://www.coldfiredesigns.com/2010/downloads/MessageClass-SayMethod.jpg)
![Screenshot 2](http://www.coldfiredesigns.com/2010/downloads/MessageClass-TellMethod.jpg)
![Screenshot 3](http://www.coldfiredesigns.com/2010/downloads/MessageClass-AskMethod.jpg)


Mootools Plugin Dependencies
----------------------------

This class requires:

	* Chain.Wait;
	* Element.Measure;
	* Element.Position;


Notes
-----

The styling is almost completely dependent upon the message.css included in the package. I do use CSS3, and I think it's about time! :)

It's been tested in IE 7+, Safari, Firefox, and Google Chrome. IE 6 is not supported.

It was developed on Mootools 1.2.4. It should work on anything 1.2. If it doesn't, contact me at http://www.coldfiredesigns.com. You'll find me there.


Demo
----

<p>You can find demos at ColdFire Designs: <a href="http://www.coldfiredesigns.com/2010/?p=1">Message Class Demo</a></p>
<p><a href="http://www.coldfiredesigns.com/2010/downloads/examples.html">Simple Demo</a></p>

