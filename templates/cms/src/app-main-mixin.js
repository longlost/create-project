
import {
	listen,
	listenOnce,
	warn
} from '@longlost/utils/utils.js';
import '@longlost/app-shell/app-shell.js';
import '@longlost/app-icons/app-icons.js';


export const AppMixin = superClass => {
  return class AppMixin extends superClass {


    static get properties() {
      return {

	      _darkMode: Boolean,
      	// Set true on window's 'load' event.
	      _loaded: {
	        type: Boolean,
	        value: false
	      },
	      // An object containing a group of functions that import overlay files.
	      // To be overwritten by app-main implementation.
	      _overlayImports: Object,
	 			// From app-shell via app-auth.
	      _user: Object

      };
    }


    connectedCallback() {
      super.connectedCallback();

      this.__windowLoadHandler();
    	listen(this, 'app-shell-dark-mode-changed', this.__darkModeChanged.bind(this));
    	listen(this, 'auth-userchanged', 						this.__userChanged.bind(this));
    	listen(this, 'open-overlay', 								this.__openOverlayHandler.bind(this)); 	
    }


	  __darkModeChanged(event) {
	    this._darkMode = event.detail.value;
	  }


	  __userChanged(event) {
	    this._user = event.detail.user;
	  }

	  // may be called directly by implementation
	  async __openOverlay(id, ...args) {
	  	try {
	  		  	
		  	if (!id) { 
		  		throw new Error('You must provide an id argument to the __openOverlay method.');
		  	}

		  	if (!this._overlayImports || !this._overlayImports[id]) { 
		  		throw new Error(`The _overlayImports class property must be an object
		  		 with keys that match the id you pass into the __openOverlay method.`);
		  	}

		  	await this._overlayImports[id]();
		  	const overlay = this.$[id];

		  	if (!overlay) {
		  		throw new Error(`Could not find the overlay, check id's.`);
		  	}

		  	if (!overlay.open || typeof overlay.open !== 'function') {
		  		throw new Error('The overlay must have an open method.');
		  	}

		  	await overlay.open(...args); // await here to catch errors here
	  	}
	  	catch (error) {
	  		console.error(error); 		
	  		warn('Sorry, we could not open the overlay.');
	  	}
	  }


	  async __openOverlayHandler(event) {
	  	try {
	  		if (!this._overlayImports) { return; }  		
		  	const {id} = event.detail;

		  	if (!id || !this._overlayImports[id]) { 
		  		throw new Error(`The 'open-overlay' event must contain a detail object with an 'id' property.
		  			The 'id' property must match the id of the overlay element in dom and the correct key in _overlayImports`);
		  	}

		  	await this.__openOverlay(id, event.detail); // await here to catch errors here
	  	}
	  	catch (error) {
	  		console.error(error); 		
	  		warn('Sorry, we could not open the overlay.');
	  	}
	  }


	  async __windowLoadHandler() {
	    await listenOnce(window, 'load');
    	this._loaded = true;
	  }

  };
};
