/**
 *	Copyright (C) 2017 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export class GroupsService {

	public static $inject: string[] = [
		"APIService",
		"TreeService",
		"MultiSelectService",
	];

	private state;

	constructor(
		private APIService: any,
		private TreeService: any,
		private MultiSelectService: any
	) {
		this.state = {
			groups: [],
			selectedGroup: {},
		};
	}


	public initGroups(teamspace, model) {
		return this.getGroups(teamspace, model)
			.then((groups) => {
				console.log(groups)
				this.state.groups = groups;
				this.cleanGroups(this.state.groups);
			});
	}

	public getDefaultGroupName(groups) {
		const groupNames = [];
		groups.forEach((group) => {
			groupNames.push(group.name);
		});

		const prefix = "Group ";
		let num = 1;
		let groupName = prefix + num;
		while (groupNames.indexOf(groupName) !== -1) {
			groupName = prefix + num++;
		}
		return groupName;
	}

	public getGroupColor(group) {
		if (group && group.color) {
			const red = group.color[0];
			const blue = group.color[1];
			const green = group.color[2];
			return `rgba(${red}, ${blue}, ${green}, 1)`;
		} 

		return "rgba(255, 255, 255, 1)";
	}

	public cleanGroups(groups) {
		groups.forEach((group) => {
			if (!group.name) {
				group.name = "No assigned name";
			}
		})
	}

	public selectGroup(group) {
		if (this.state.selectedGroup) {
			this.state.selectedGroup.selected = false;
		}
		this.state.selectedGroup = group;
		this.state.selectedGroup.selected = true;

		if (this.state.selectedGroup.objects) {	
			console.log(this.state.selectedGroup.objects);
			const multi = this.MultiSelectService.isMultiMode();
			const color = this.state.selectedGroup.color.map((c) => c / 255);
			
			this.TreeService.selectNodesByIds(
				this.state.selectedGroup.objects,
				multi, // multi
				true,
				color,
			);
		}

	}

	public changeSelectedGroupColor() {
		this.state.selectedGroup.color = [
			parseInt(255 * Math.random()), 
			parseInt(255 * Math.random()),
			parseInt(255 * Math.random())
		];
		const color = this.state.selectedGroup.color.map((c) => c / 255);
		this.TreeService.selectNodesByIds(
			this.state.selectedGroup.objects,
			false, // multi
			true,
			color,
		);
	}


	public createGroupData(group) {
		if (!group) {
			console.error("No group object was passed to createGroupData");
			return;
		}
		const groupData = {
			name: group.name,
			author: group.author,
			description: group.description,
			createdAt: group.createdAt || Date.now(),
			color: group.color || [255, 0, 0],
			objects: this.TreeService.getCurrentSelectedNodes(),
		};
		return groupData;
	}

	public getGroups(teamspace, model) {
		const groupUrl = `${teamspace}/${model}/groups?noIssues=true`;

		return this.APIService.get(groupUrl)
			.then((response) => {
				this.state.groups = response.data;
			});
	}

	public updateGroup(teamspace, model, groupId, group) {

		const groupUrl = `${teamspace}/${model}/groups/${groupId}`;
		const groupData = this.createGroupData(group);
		console.log("updateGroup", groupData);
		return this.APIService.put(groupUrl, groupData)
			.then((response) => {
				const newGroup = response.data;
				newGroup.new = false;
				this.replaceStateGroup(newGroup)
				return newGroup;
			});
	}

	public createGroup(teamspace, model, group) {
		const groupUrl = `${teamspace}/${model}/groups/`;
		const groupData = this.createGroupData(group);
		
		return this.APIService.post(groupUrl, groupData)
			.then((response) => {
				const newGroup = response.data;
				newGroup.new = false;
				this.state.groups.push(newGroup);
				return newGroup;
			});
	}

	public deleteGroup(teamspace, model, deleteGroup) {
		const groupUrl = `${teamspace}/${model}/groups/${deleteGroup._id}`;
		return this.APIService.delete(groupUrl)
			.then((response) => {
				this.deleteStateGroup(deleteGroup)
				return response;
			});
	}

	public deleteStateGroup(deleteGroup) {
		this.state.groups = this.state.groups.filter((g) => {
			return deleteGroup._id !== g._id
		}); 
		if (deleteGroup._id === this.state.selectedGroup._id) {
			this.state.selectedGroup = null;
		}
	}

	public replaceStateGroup(newGroup) {

		// We need to update the local date state
		this.state.groups.forEach((group, i) => { 
			if (newGroup._id === group._id) {
				this.state.groups[i] = newGroup; 
			} 
		});

		// And do the same if it's the selected group
		if (newGroup._id === this.state.selectedGroup._id) {
			this.state.selectedGroup = newGroup;
		}
	}
	
	
}

export const GroupsServiceModule = angular
	.module("3drepo")
	.service("GroupsService", GroupsService);
