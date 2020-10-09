const _ = require('lodash');
const inquirer = require('inquirer');

/**
 * Class Processor
 */
class Processor {

    /**
     * Merge duplicated ticket id
     *
     * @param {Array} commits
     * @return {Array}
     */
    async mergeByTicketId(commits) {
        const groupTicketIds = _.groupBy(commits, (commit) => commit.ticket.id);
        const questions = [];

        const ticketIds = Object.keys(groupTicketIds);

        _.forEach(ticketIds, (key) => {
            const ticketId = _.get(groupTicketIds[key], '0.ticket.id');
            const messages = _.map(groupTicketIds[key], (item) => item.message);
            if (_.isEmpty(ticketId) || (!_.isEmpty(messages) && messages.length === 1)) {
                return;
            }
            questions.push({
                type: 'list',
                name: `${ticketId}`,
                message: `Please choose message for ${ticketId}:`,
                choices: messages,
                default: _.first(messages)
            });
        });
        const answers = await inquirer.prompt(questions);

        const newCommits = [];
        _.forEach(ticketIds, (key) => {
            const newCommit = _.first(groupTicketIds[key]);

            newCommit.pullRequests = groupTicketIds[key];
            newCommit.message = _.get(answers, newCommit.ticket.id)

            newCommits.push(newCommit);
        });

        return newCommits
    }
}

module.exports = Processor