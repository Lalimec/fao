import fs from 'fs';
import * as path from 'path';
import parse from 'csv-parse';
import { randomItemFrom } from '../../common/util.js';

const SUPPORTED_LANGUAGES = ['en', 'tr'];
const DEFAULT_LANGUAGE = 'en';

// Map of language code to prompts array
let promptsByLanguage = {};

function getFilenameForLanguage(lang) {
	if (lang === 'en') {
		return path.resolve(__dirname, 'prompts.csv');
	}
	return path.resolve(__dirname, `prompts_${lang}.csv`);
}

function loadPromptsForLanguage(lang) {
	return new Promise(function(resolve, reject) {
		const filename = getFilenameForLanguage(lang);
		fs.readFile(filename, function(err, fileData) {
			if (err) {
				console.error(`Failed to load prompts for language: ${lang}`, err);
				reject(err);
				return;
			}
			parse(fileData, { columns: true, trim: true }, function(err, output) {
				if (err) {
					reject(err);
				} else {
					validatePromptHeaders(output);
					promptsByLanguage[lang] = output;
					resolve(output);
				}
			});
		});
	});
}

function loadPrompts() {
	// Load all supported languages
	return Promise.all(SUPPORTED_LANGUAGES.map(lang => loadPromptsForLanguage(lang)));
}

function validatePromptHeaders(prompts) {
	let item = prompts[0];
	if (item.keyword && item.hint) {
		return true;
	} else {
		throw new Error('Incorrect prompt headers');
	}
}

function getRandomPrompt(lang = DEFAULT_LANGUAGE) {
	const prompts = promptsByLanguage[lang] || promptsByLanguage[DEFAULT_LANGUAGE];
	if (prompts === undefined) {
		console.error(`No prompts found for language: ${lang}`);
	}
	return randomItemFrom(prompts);
}

function getSupportedLanguages() {
	return SUPPORTED_LANGUAGES;
}

export { loadPrompts, getRandomPrompt, getSupportedLanguages, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };
