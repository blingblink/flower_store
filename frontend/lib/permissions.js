import { UserRoles } from '@/constants';

const roles = {
	[UserRoles.Admin]: 0,
    [UserRoles.Employee]: 1,
    [UserRoles.User]: 2,
    [UserRoles.Guest]: 3,
};

const permissions = {
	0: {
		read: ['*'],
		write: ['*'],
	},
	1: {
		read: ['*'],
		write: ['*'],
	},
	2: {
		read: ['*'],
		write: ['*'],
	},
	3: {
        read: ['*'],
		write: ['*'],
	},
};

const hasPermission = ({ user, resource=null, action='read' }) => {
	if (!user) return false;

	const roleId = (user.role === null || user.role === undefined) ? 3 : roles[user.role];
	const rolePermissions = permissions[roleId] || {};
	const actionPermissions = rolePermissions[action] || [];
	if (actionPermissions.length > 0 && (actionPermissions[0] === '*' || actionPermissions.includes(resource)))
		return true;
	return false;
};

const isAdmin = ({ user }) => {
    return (
        user && roles[user.role] <= 0
    )
}

const isEmployee = ({ user }) => {
    return (
        user && roles[user.role] <= 1
    )
}

export {
	roles,
	permissions,
	hasPermission,
    isAdmin,
    isEmployee,
};