const soap = require('soap');

const product = {
    name: 'My Product',
    about: 'Description',
    price: 50.47
};

const productId = {
    id: '1',
};

const patchProduct = {
    id: '2',
    name: 'Hello'
};

const callback = (err, result) => {
    if (err) {
        console.log('Error making SOAP request: ',
            err.response.status,
            err.response.statusText,
            err.body
        );
        return;
    }

    console.log('Result: ', result);
};

soap.createClient('http://localhost:8000/products?wsdl', {}, async function (err, client) {
    if (err) {
        console.error('Error creating the SOAP client: ', err);
        return;
    }

    // client.CreateProduct(product, callback);

    // client.GetProducts(null, callback);

    // client.GetProduct(productId, callback);

    client.PatchProduct(patchProduct, callback);

    // client.DeleteProduct(productId, callback);
});
