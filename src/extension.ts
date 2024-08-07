import * as vscode from 'vscode';
import { GitExtension } from './git';

const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')!.exports;
const git = gitExtension.getAPI(1);

export type Remote = {
	name: string;
	fetchUrl: string;
	pushUrl: string;
	isReadOnly: boolean;
};

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('open-git-remote.open-git-remote', async () => {
			/** Structure: [repoName, name, url] */
			const remotes: [string, string, string][] = [];
			let reposCount = 0;
			// map all remotes of all repositories
			for (const repo of git.repositories) {
				reposCount++;
				const repoName: string = repo.rootUri.fsPath; // using path as name
				const repoRemotes: Remote[] = (repo as any).repository.remotes;
				for (const remote of (repoRemotes as Remote[])) {
					remotes.push([
						repoName,
						remote.name,
						remote.fetchUrl,
					]);
				}
			}
			if (reposCount === 0) {
				vscode.window.showErrorMessage('This project has no remotes');
				return;
			}
			const mappedRemotes: { [key: string]: string } = {};
			for (const remote of remotes) {
				let str = remote[1];
				if (reposCount > 1) {
					str += '   ' + remote[0];
				}
				mappedRemotes[str] = remote[2];
				// remote   repo = url
			}
			const choice = await vscode.window.showQuickPick(
				Object.keys(mappedRemotes)
			);
			if (!choice) {
				return;
			}
			const url = mappedRemotes[choice];
			await vscode.env.openExternal(vscode.Uri.parse(url));
		})
	);
}

export function deactivate() {}
