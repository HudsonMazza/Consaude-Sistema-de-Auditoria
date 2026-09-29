// ConSaúde design system — bundle entry. Assigns window.ConSaude.
import * as core from './core.jsx';
import * as overlays from './overlays.jsx';
import * as forms from './forms.jsx';
import * as data from './data.jsx';
import * as layout from './layout.jsx';
import * as screens from './screens.jsx';
import * as demo from './demo-data.js';
const api = Object.assign({}, core, overlays, forms, data, layout, { screens, demo });
window.ConSaude = Object.assign(window.ConSaude || {}, api);
