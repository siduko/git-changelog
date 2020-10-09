const _ = require('lodash');
const fs = require('fs');

/**
 * Class Renderer
 */
class Renderer {
    /**
     * Render to string
     *
     * @param {String} templatePath
     * @param {Object} parameters
     * @return {String}
     */
    render(templatePath, parameters) {
        const compiled = _.template(fs.readFileSync(templatePath, 'utf8'));
        return compiled(parameters);
    }

    /**
     * Render to console
     *
     * @param {String} templatePath
     * @param {Object} parameters
     */
    renderConsole(templatePath, parameters) {
        console.log(this.render(templatePath, parameters))
    }
}

module.exports = Renderer;