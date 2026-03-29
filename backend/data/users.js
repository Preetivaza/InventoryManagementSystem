import bcrypt from 'bcryptjs';

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: '123456',
        role: 'admin',
    },
    {
        name: 'Sarah Johnson',
        email: 'manager@example.com',
        password: '123456',
        role: 'manager',
    },
    {
        name: 'Michael Chen',
        email: 'staff@example.com',
        password: '123456',
        role: 'staff',
    },
    {
        name: 'Emily Rodriguez',
        email: 'emily@example.com',
        password: '123456',
        role: 'staff',
    },
    {
        name: 'David Kim',
        email: 'david@example.com',
        password: '123456',
        role: 'manager',
    },
];

// Hash passwords
const salt = bcrypt.genSaltSync(10);
users.forEach(user => {
    user.password = bcrypt.hashSync(user.password, salt);
});

export default users;
