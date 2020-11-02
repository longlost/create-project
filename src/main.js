/**
	*		Thanks to the twillio blog 
	*
	*		Find step by step instructions as to how this was made at:
	*
	*			https://www.twilio.com/blog/how-to-build-a-cli-with-node-js
	*
	*
	**/


import chalk 				 		from 'chalk';
import fs 					 		from 'fs';
import ncp 					 		from 'ncp';
import path 				 		from 'path';
import {promisify} 			from 'util';
import execa 						from 'execa';
import Listr 						from 'listr';
import {projectInstall} from 'pkg-install';


const access 	= promisify(fs.access);
const copy 	 	= promisify(ncp);
const readdir = promisify(fs.readdir);
const rename 	= promisify(fs.rename);


const copyTemplateFiles = options => 
	copy(options.templateDirectory, options.targetDirectory, {clobber: false});


const initGit = async options => {

	const result = await execa('git', ['init'], {
		cwd: options.targetDirectory
	});

	if (result.failed) {
		throw new Error('Failed to initialize git');
	}

	return;
};

// Npm automatically renames existing '.gitignore' files to '.npmignore'.
// This is NOT the desired behavior.
// Npm documentation and issues state that this is not a bug, 
// and will not be changed in the future. 
// Also, there is no fix or options to override this so therefore,
// the only option is to undo the change afterward.
const undoGitIgnoreRename = async options => {

	const dir 	= options.targetDirectory;
	const files = await readdir(dir);

	

	console.log('Files: ', files);



	const gitignorePath = files.find(file => file.includes('gitignore'));


	console.log('gitignorePath: ', gitignorePath);


	// No need to rename if it already exists.
	if (gitignorePath) { return; }

	const npmignorePath = files.find(file => file.includes('npmignore'));


	console.log('npmignorePath: ', npmignorePath);


	// No '.npmignore' file found. Bail.
	if (!npmignorePath) { return; }

	const dirname = path.dirname(npmignorePath);
	const newPath = path.join(dirname, '.gitignore');


	console.log('newPath: ', newPath);
	

	return rename(npmignorePath, newPath);
};


export const createProject = async options => {
	options = {
		...options,
		targetDirectory: options.targetDirectory || process.cwd(),
	};

	const currentFileUrl = import.meta.url;

	const templateDir = path.resolve(
		new URL(currentFileUrl).pathname,
		'../../templates',
		options.template.toLowerCase()
	);

	options.templateDirectory = templateDir;

	try {
		await access(templateDir, fs.constants.R_OK);
	} 
	catch (_) {
		console.error(`${chalk.red.bold('ERROR')} Invalid template name`);
		process.exit(1);
	}

	const tasks = new Listr([
		{
			title: 'Copy project files',
			task: 	() => copyTemplateFiles(options)
		},
		{
			title: 	'Initialize git',
			task: 	 () => initGit(options),
			enabled: () => options.git
		},
		{
			title: 'Install dependencies',
			task: 	() => projectInstall({cwd: options.targetDirectory}),
			skip: 	() => !options.runInstall ? 
											'Pass --install to automatically install dependencies' : undefined
		},
		{
			title: 'Undoing gitignore rename',
			task: 	() => undoGitIgnoreRename(options)
		}
	]);

	await tasks.run();

	console.log(`${chalk.green.bold('DONE')} Project ready`);

	return true;
};
