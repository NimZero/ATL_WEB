const express = require('express');
const postgres = require('postgres');
const crypto = require('crypto');
const zod = require('zod');

const port = 8000;

const app = express();
app.use(express.json());

const sql = postgres({ db: 'mydb', user: 'user', password: 'password' });

const ProductSchema = zod.object({
    id: zod.string(),
    name: zod.string(),
    about: zod.string(),
    price: zod.number().positive(),
});
const CreateProductSchema = ProductSchema.omit({ id: true });

const UserSchema = zod.object({
    id: zod.string(),
    name: zod.string(),
    email: zod.string(),
});
const CreateUserSchema = UserSchema.extend({ password: zod.string() }).omit({ id: true });
const PatchUserSchema = CreateUserSchema.partial();

app.get('/products', async (req, res) => {
    const products = await sql`
        SELECT * FROM products
    `;

    res.send(products);
});

app.post('/products', async (req, res) => {
    const result = await CreateProductSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).send(result);
        return;
    }

    const { name, about, price } = result.data;

    const product = await sql`
        INSERT INTO products (name, about, price)
        VALUES (${name}, ${about}, ${price})
        RETURNING *
    `;

    res.send(product[0]);
});

app.get('/products/:id', async (req, res) => {
    const id = req.params.id;

    const product = await sql`
        SELECT * FROM products
        WHERE id = ${id}
    `;

    if (product.length > 0) {
        res.status(201).send(product[0]);
    } else {
        res.status(404).send({ message: 'Not Found' });
    }
});

app.delete('/products/:id', async (req, res) => {
    const id = req.params.id;

    const product = await sql`
        DELETE FROM products
        WHERE id = ${id}
        RETURNING *
    `;

    if (product.length > 0) {
        res.send(product[0]);
    } else {
        res.status(404).send({ message: 'Not Found' });
    }
});

app.get('/users', async (req, res) => {
    const users = await sql`
        SELECT id, name, email FROM users
    `;

    res.send(users);
});

app.post('/users', async (req, res) => {
    const result = await CreateUserSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).send(result);
        return;
    }

    var hash = crypto.createHash('sha512');

    let { name, email, password } = result.data;
    password = hash.update(password, 'utf-8');
    password = password.digest('hex');

    const user = await sql`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${password})
        RETURNING id, name, email
    `;

    res.send(user[0]);
});

app.get('/users/:id', async (req, res) => {
    const id = req.params.id;

    const user = await sql`
        SELECT id, name, email FROM users
        WHERE id = ${id}
    `;

    if (user.length > 0) {
        res.status(201).send(user[0]);
    } else {
        res.status(404).send({ message: 'Not Found' });
    }
});

app.put('/users/:id', async (req, res) => {
    const id = req.params.id;

    const exists = await sql`
        SELECT id FROM users
        WHERE id=${id}
    `;

    if (exists.length < 1) {
        res.status(404).send('Not Found');
        return;
    }

    const result = await CreateUserSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).send(result);
        return;
    }

    var hash = crypto.createHash('sha512');

    let { name, email, password } = result.data;
    password = hash.update(password, 'utf-8');
    password = password.digest('hex');

    await sql`
        DELETE FROM users
        WHERE id = ${id}
    `;

    const user = await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${id}, ${name}, ${email}, ${password})
        RETURNING id, name, email
    `;

    res.send(user[0]);
});

app.patch('/users/:id', async (req, res) => {
    const id = req.params.id;

    const exists = await sql`
        SELECT id FROM users
        WHERE id=${id}
    `;

    if (exists.length < 1) {
        res.status(404).send('Not Found');
        return;
    }

    const result = await PatchUserSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).send(result);
        return;
    }

    const updateData = result.data;

    // Hash the password if it's supplied
    if (updateData.password) {
        const hashedPassword = crypto.createHash('sha512').update(updateData.password).digest('hex');
        updateData.password = hashedPassword;
    }

    const updateFields = Object.keys(updateData).map(key => sql`${key} = ${updateData[key]}`);
    const user = await sql`
        UPDATE users
        SET ${sql.join(updateFields, ', ')}
        WHERE id = ${id}
        RETURNING *
    `;

    res.send(user[0]);
});

app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;

    const user = await sql`
        DELETE FROM users
        WHERE id = ${id}
        RETURNING id, name, email
    `;

    if (user.length > 0) {
        res.send(user[0]);
    } else {
        res.status(404).send({ message: 'Not Found' });
    }
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
