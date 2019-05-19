/**
	*		Thanks to the twillio blog 
	*
	*		Find step by step instructions as to how this was made at:
	*
	*			https://www.twilio.com/blog/how-to-build-a-cli-with-node-js
	*
	*
	**/ 
import arg 						 from 'arg';
import inquirer 			 from 'inquirer';
import {createProject} from './main';


const parseArgumentsIntoOptions = rawArgs => {
	const args = arg(
		{
			'--git': 		 Boolean,
			'--yes': 		 Boolean,
			'--install': Boolean,
			'-g': 			'--git',
			'-y': 			'--yes',
			'-i': 			'--install',
		},
		{
			argv: rawArgs.slice(2),
		}
	);
	return {
		skipPrompts: args['--yes'] || false,
		git: 				 args['--git'] || false,
		template: 	 args._[0],
		runInstall:  args['--install'] || false
	};
};


const promptForMissingOptions = async options => {

	const defaultTemplate = 'Client';

	if (options.skipPrompts) {
		return {
			...options,
			template: options.template || defaultTemplate
		};
	}

	const questions = [];

	if (!options.template) {
		questions.push({
			type: 	 'list',
			name: 	 'template',
			message: 'Please choose which project template to use',
			choices: ['Client', 'CMS'],
			default: defaultTemplate
		});
	}

	if (!options.git) {
		questions.push({
			type: 	 'confirm',
			name: 	 'git',
			message: 'Initialize a git repository?',
			default: false
		});
	}

	const answers = await inquirer.prompt(questions);

	return {
		...options,
		template: options.template || answers.template,
		git: 			options.git 		 || answers.git,
	};
};


export async function cli(args) {
	const options 					 = parseArgumentsIntoOptions(args);
	const optionsAfterPrompt = await promptForMissingOptions(options);
	await createProject(optionsAfterPrompt);
}
