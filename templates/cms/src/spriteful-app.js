
import {
  SpritefulElement, 
  html
}                 from '@spriteful/spriteful-element/spriteful-element.js';
import {
  listen
}                 from '@spriteful/utils/utils.js';
import htmlString from './spriteful-app.html';
import '@spriteful/app-shell/app-shell.js';
import '@spriteful/scroll-fab/scroll-fab.js';
import '@polymer/paper-input/paper-input.js'; // prevent a flash when lazy loading other inputs
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';


class SpritefulApp extends SpritefulElement {
  static get is() { return 'spriteful-app'; }

	static get template() {
		return html([htmlString]);
	}


  static get properties() {
    return {
      // webpack must 'see' the full path strings in each dynamic import
      // cannot use variables in import statements that refer to folders outside of
      // spriteful since webpack does not know of their existence
      _imports: {
        type: Object,
        value: {
          orders:  () => import('@spriteful/example-view/example-view.js'),
          reports: () => import('@spriteful/example-view/example-view.js')
        }
      },
      // from app-shell
      _selectedPage: String,

      _user: Object

    };
  }


  async connectedCallback() {
    super.connectedCallback();
    
    listen(this, 'auth-userchanged',    this.__userChanged.bind(this));
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
