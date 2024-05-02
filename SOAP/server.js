const soap = require('soap');
const fs = require('node:fs');
const http = require('http');
const postgres = require('postgres');

const sql = postgres({ db: 'mydb', user: 'user', password: 'password' });

const service = {
    ProductsService: {
        ProductsPort: {
            CreateProduct: async function ({ name, about, price }, callback) {
                if (!name || !about || !price) {
                    throw {
                        Fault: {
                            Code: {
                                Value: 'soap:Sender',
                                Subcode: { value: 'rcp:BadArguments' },
                            },
                            Reason: { Text: 'Processing Error' },
                            statusCode: 400,
                        },
                    };
                }

                const product = await sql`
                    INSERT INTO products (name, about, price)
                    VALUES (${name}, ${about}, ${price})
                    RETURNING *
                `;

                callback(product[0]);
            },
            GetProducts: async function (args, callback) {
                const products = await sql`
                    SELECT * FROM products
                `;

                callback(products);
            },
            PatchProduct: async function (args, callback) {
                const id = args.id;
                delete args.id;

                callback(product[0]);
            },
            GetProduct: async function ({ id }, callback) {
                if (!id) {
                    throw {
                        Fault: {
                            Code: {
                                Value: 'soap:Sender',
                                Subcode: { value: 'rcp:BadArguments' },
                            },
                            Reason: { Text: 'Processing Error' },
                            statusCode: 400,
                        },
                    };
                }
                const product = await sql`
                    SELECT * FROM products
                    WHERE id=${id}
                `;

                callback(product[0]);
            },
            DeleteProduct: async function ({ id }, callback) {
                if (!id) {
                    throw {
                        Fault: {
                            Code: {
                                Value: 'soap:Sender',
                                Subcode: { value: 'rcp:BadArguments' },
                            },
                            Reason: { Text: 'Processing Error' },
                            StatusCode: 400,
                        },
                    };
                }
                try {
                    const product = await sql`
                        DELETE FROM products
                        WHERE id=${id}
                    `;
                    callback({ success: true });
                } catch (error) {
                    callback({ success: false });
                }
            },
        },
    },
};

const server = http.createServer(function (request, response) {
    response.end('404: Not Found: ' + request.url);
});

server.listen(8000);

const xml = fs.readFileSync('ProductsService.wsdl', 'utf8');
soap.listen(server, '/products', service, xml, function () {
    console.log('SOAP server running at http://localhost:8000/products?wsdl');
});
