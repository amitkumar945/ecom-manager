from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)

# MongoDB Connection
client = MongoClient('mongodb://localhost:27017/')
db = client['ecom_management_db']

# Collections
products = db.products
customers = db.customers
orders = db.orders
reviews = db.reviews

@app.route('/')
def index():
    return render_template('index.html')

# ====================== PRODUCTS ======================
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'GET':
        data = list(products.find())
        for item in data: item['_id'] = str(item['_id'])
        return jsonify(data)
    else:
        data = request.get_json()
        data['created_at'] = datetime.utcnow()
        result = products.insert_one(data)
        return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/products/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def single_product(id):
    if request.method == 'GET':
        item = products.find_one({'_id': ObjectId(id)})
        if item: 
            item['_id'] = str(item['_id'])
            return jsonify(item)
        return jsonify({'error': 'Not found'}), 404
    elif request.method == 'PUT':
        data = request.get_json()
        result = products.update_one({'_id': ObjectId(id)}, {'$set': data})
        return jsonify({'message': 'Updated'}) if result.modified_count else jsonify({'error': 'Not found'}), 404
    else:
        result = products.delete_one({'_id': ObjectId(id)})
        return jsonify({'message': 'Deleted'}) if result.deleted_count else jsonify({'error': 'Not found'}), 404

# ====================== CUSTOMERS ======================
@app.route('/api/customers', methods=['GET', 'POST'])
def handle_customers():
    if request.method == 'GET':
        data = list(customers.find())
        for item in data: item['_id'] = str(item['_id'])
        return jsonify(data)
    else:
        data = request.get_json()
        data['joined_at'] = datetime.utcnow()
        result = customers.insert_one(data)
        return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/customers/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def single_customer(id):
    if request.method == 'GET':
        item = customers.find_one({'_id': ObjectId(id)})
        if item: 
            item['_id'] = str(item['_id'])
            return jsonify(item)
        return jsonify({'error': 'Not found'}), 404
    elif request.method == 'PUT':
        data = request.get_json()
        result = customers.update_one({'_id': ObjectId(id)}, {'$set': data})
        return jsonify({'message': 'Updated'}) if result.modified_count else jsonify({'error': 'Not found'}), 404
    else:
        result = customers.delete_one({'_id': ObjectId(id)})
        return jsonify({'message': 'Deleted'}) if result.deleted_count else jsonify({'error': 'Not found'}), 404

# ====================== ORDERS ======================
@app.route('/api/orders', methods=['GET', 'POST'])
def handle_orders():
    if request.method == 'GET':
        data = list(orders.find())
        for item in data: item['_id'] = str(item['_id'])
        return jsonify(data)
    else:
        data = request.get_json()
        data['order_date'] = datetime.utcnow()
        result = orders.insert_one(data)
        return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/orders/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def single_order(id):
    if request.method == 'GET':
        item = orders.find_one({'_id': ObjectId(id)})
        if item: 
            item['_id'] = str(item['_id'])
            return jsonify(item)
        return jsonify({'error': 'Not found'}), 404
    elif request.method == 'PUT':
        data = request.get_json()
        result = orders.update_one({'_id': ObjectId(id)}, {'$set': data})
        return jsonify({'message': 'Updated'}) if result.modified_count else jsonify({'error': 'Not found'}), 404
    else:
        result = orders.delete_one({'_id': ObjectId(id)})
        return jsonify({'message': 'Deleted'}) if result.deleted_count else jsonify({'error': 'Not found'}), 404

# ====================== REVIEWS ======================
@app.route('/api/reviews', methods=['GET', 'POST'])
def handle_reviews():
    if request.method == 'GET':
        data = list(reviews.find())
        for item in data: item['_id'] = str(item['_id'])
        return jsonify(data)
    else:
        data = request.get_json()
        data['review_date'] = datetime.utcnow()
        result = reviews.insert_one(data)
        return jsonify({'_id': str(result.inserted_id)}), 201

@app.route('/api/reviews/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def single_review(id):
    if request.method == 'GET':
        item = reviews.find_one({'_id': ObjectId(id)})
        if item: 
            item['_id'] = str(item['_id'])
            return jsonify(item)
        return jsonify({'error': 'Not found'}), 404
    elif request.method == 'PUT':
        data = request.get_json()
        result = reviews.update_one({'_id': ObjectId(id)}, {'$set': data})
        return jsonify({'message': 'Updated'}) if result.modified_count else jsonify({'error': 'Not found'}), 404
    else:
        result = reviews.delete_one({'_id': ObjectId(id)})
        return jsonify({'message': 'Deleted'}) if result.deleted_count else jsonify({'error': 'Not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)