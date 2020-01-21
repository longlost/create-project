
import {AppMainMixin} from '@longlost/app-shell/app-main-mixin.js';
import {html}         from '@longlost/app-element/app-element.js';
import htmlString     from './app-main.html';
import '@longlost/scroll-fab/scroll-fab.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';


class AppMain extends AppMainMixin() {
  static get is() { return 'app-main'; }

	static get template() {
		return html([htmlString]);
	}


  static get properties() {
    return {
      // webpack must 'see' the full path strings in each dynamic import
      // cannot use variables in import statements that refer to folders outside of
      // project since webpack does not know of their existence
      _imports: {
        type: Object,
        value: {
          orders:  () => 
            import(/* webpackChunkName: 'example-view' */'@longlost/example-view/example-view.js'),
          reports: () => 
            import(/* webpackChunkName: 'example-view' */'@longlost/example-view/example-view.js')
        }
      }

    };
  }
  
}

window.customElements.define(AppMain.is, AppMain);
