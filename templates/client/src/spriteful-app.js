
import {
  SpritefulElement, 
  html
}                       from '@spriteful/spriteful-element/spriteful-element.js';
import {
  listen
}                       from '@spriteful/utils/utils.js';
import htmlString       from './spriteful-app.html';
import accountHeaderImg from 'images/BlueOrangeBackground.jpg'
import '@spriteful/app-shell/app-shell.js';
// import './spriteful/test-view.js'; // initial page should be loaded here for best first paint exp

/**
  * "views-slot" items must have a page, label and 
  * path attributes/properties set to work with menu links. 
  * page attr is used for proper routing between pages, 
  * label is the menu link name,
  * and path is needed for lazy-loading each view
  *
  *
  * "overlays-slot" items must have an id, label and path attributes/properties set to work with menu links. 
  * id attr is used to dynamically find and open the overlay, label is the menu link name,
  * and path is needed for lazy-loading each overlay
  *
  *
  **/


class SpritefulApp extends SpritefulElement {
  static get is() { return 'spriteful-app'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      _accountHeaderImg: Object,
      // webpack must 'see' the full path strings in each dynamic import
      // cannot use variables in import statements that refer to folders outside of
      // spriteful since webpack does not know of their existence
      _imports: {
        type: Object,
        value: {
          view1:   () => import('@spriteful/example-view/example-view.js'),
          view2:   () => import('@spriteful/example-view/example-view.js'),
          view3:   () => import('@spriteful/example-view/example-view.js'),
          example: () => import('@spriteful/fancy-header-example/fancy-header-example.js')
        }
      },      
      // from app-shell
      _selectedPage: String,

      _user: Object

    };
  }


  connectedCallback() {
    super.connectedCallback();

    this._accountHeaderImg = accountHeaderImg;    
    listen(this, 'auth-userchanged', this.__userChanged.bind(this));
  }


  __showAuth() {
    this.$.appShell.showAuthUI();
  }


  __userChanged(event) {
    const {user} = event.detail;
    this._user   = user;
  }
  
}

window.customElements.define(SpritefulApp.is, SpritefulApp);
