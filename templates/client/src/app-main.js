
import {AppMainMixin}   from '@longlost/app-main-mixin/app-main-mixin.js';
import {html}           from '@longlost/app-element/app-element.js';
import htmlString       from './app-main.html';
import accountHeaderImg from 'images/BlueOrangeBackground.jpg'
// import './my-view.js'; // initial page should be loaded here for best first paint exp

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


class AppMain extends AppMainMixin() {
  static get is() { return 'app-main'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      _accountHeaderImg: Object,
      // webpack must 'see' the full path strings in each dynamic import
      // cannot use variables in import statements that refer to folders outside of
      // project since webpack does not know of their existence
      _imports: {
        type: Object,
        value: {
          view1: () => 
            import(/* webpackChunkName: 'example-view' */'@longlost/example-view/example-view.js'),
          view2: () => 
            import(/* webpackChunkName: 'example-view' */'@longlost/example-view/example-view.js'),
          view3: () => 
            import(/* webpackChunkName: 'example-view' */'@longlost/example-view/example-view.js'),
          fancy: () => 
            import(/* webpackChunkName: 'fancy-header' */'@longlost/fancy-header-example/fancy-header-example.js')
        }
      },

      _overlayImports: {
        type: Object,
        value: {
          fancy: () => 
            import(/* webpackChunkName: 'fancy-header' */'@longlost/fancy-header-example/fancy-header-example.js')
        }
      },

      _seoOverlayIds: {
        type: Object,
        value: {
          fancy: 'fancy' // key is route, val is id
        }
      }

    };
  }


  connectedCallback() {
    super.connectedCallback();

    this._accountHeaderImg = accountHeaderImg; 
  }
  
}

window.customElements.define(AppMain.is, AppMain);
