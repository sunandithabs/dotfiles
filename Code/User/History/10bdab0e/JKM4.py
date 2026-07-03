from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import hashlib
import os
import json
from db import get_db, init_db, seed_menu

init_db()  # creates all tables automatically when app starts
seed_menu() # insert items into menu_items table
app = Flask(__name__)
app.secret_key = os.urandom(24)

# In-memory user store (no DB/API)
users = {}


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def get_cart():
    """Get cart from session, initialize if not exists"""
    if 'cart' not in session:
        session['cart'] = []
    return session['cart']


def get_user_context():
    """Get current user info if logged in"""
    if 'user' not in session:
        return None
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (session['user'],))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user


@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm', '')

        if not name or not email or not password:
            flash('All fields are required.', 'error')
            return render_template('signup_page.html', is_logged_in=False)

        if password != confirm:
            flash('Passwords do not match.', 'error')
            return render_template('signup_page.html', is_logged_in=False)

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'error')
            return render_template('signup_page.html', is_logged_in=False)

        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # check if user already exists
        cursor.execute(
            "SELECT * FROM users WHERE email = %s",
            (email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            flash('An account with this email already exists.', 'error')
            cursor.close()
            conn.close()
            return render_template('signup_page.html', is_logged_in=False)

        # insert new user
        cursor.execute("""
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
        """, (name, email, hash_password(password)))

        conn.commit()

        cursor.close()
        conn.close()

        session['user'] = email

        flash(f'Welcome, {name}! Your account has been created.', 'success')
        return redirect(url_for('dashboard'))

    return render_template('signup_page.html', is_logged_in=False)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # find user by email
        cursor.execute(
            "SELECT * FROM users WHERE email = %s",
            (email,)
        )

        user = cursor.fetchone()

        cursor.close()
        conn.close()

        # check password
        if not user or user['password'] != hash_password(password):
            flash('Invalid email or password.', 'error')
            return render_template('login_page.html', is_logged_in=False)

        session['user'] = email

        flash(f'Welcome back, {user["name"]}!', 'success')
        return redirect(url_for('dashboard'))

    return render_template('login_page.html', is_logged_in=False)

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # get all menu items
    cursor.execute("SELECT * FROM menu_items")
    menu_items = cursor.fetchall()

    # get current user
    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (session['user'],)
    )
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    cart = get_cart()
    return render_template(
        'home.html',
        user=user,
        menu_items=menu_items,
        cart=cart,
        is_logged_in=True
    )

@app.route('/add-to-cart', methods=['POST'])
def add_to_cart():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.get_json()
    item_id = data.get('id')
    item_name = data.get('name')
    item_price = data.get('price')
    
    cart = get_cart()
    
    # Check if item already in cart
    existing_item = next((item for item in cart if item['id'] == item_id), None)
    if existing_item:
        existing_item['quantity'] += 1
    else:
        cart.append({
            'id': item_id,
            'name': item_name,
            'price': item_price,
            'quantity': 1
        })
    
    session['cart'] = cart
    session.modified = True
    
    return jsonify({'success': True, 'cart_count': len(cart)})

@app.route('/remove-from-cart', methods=['POST'])
def remove_from_cart():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.get_json()
    item_id = data.get('id')
    
    cart = get_cart()
    cart[:] = [item for item in cart if item['id'] != item_id]
    
    session['cart'] = cart
    session.modified = True
    
    return jsonify({'success': True, 'cart_count': len(cart)})

@app.route('/update-cart-qty', methods=['POST'])
def update_cart_qty():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.get_json()
    item_id = data.get('id')
    quantity = data.get('quantity', 1)
    
    cart = get_cart()
    for item in cart:
        if item['id'] == item_id:
            if quantity <= 0:
                cart.remove(item)
            else:
                item['quantity'] = quantity
            break
    
    session['cart'] = cart
    session.modified = True
    
    return jsonify({'success': True})

@app.route('/cart')
def view_cart():
    if 'user' not in session:
        return redirect(url_for('login'))
    
    user = get_user_context()
    cart = get_cart()
    
    # Calculate totals
    total = sum(item['price'] * item['quantity'] for item in cart)
    
    return render_template(
        'cart.html',
        user=user,
        cart=cart,
        total=total,
        is_logged_in=True
    )

@app.route('/checkout', methods=['POST'])
def checkout():
    if 'user' not in session:
        return redirect(url_for('login'))

    cart = get_cart()
    if not cart:
        flash('Your cart is empty. Add items before checkout.', 'error')
        return redirect(url_for('view_cart'))

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (session['user'],)
    )
    user = cursor.fetchone()

    if not user:
        cursor.close()
        conn.close()
        session.clear()
        return redirect(url_for('login'))

    total = sum(item['price'] * item['quantity'] for item in cart)
    cursor.execute(
        "INSERT INTO orders (user_id, status, address) VALUES (%s, %s, %s)",
        (user['id'], 'confirmed', 'Delivery details will be confirmed shortly.')
    )
    order_id = cursor.lastrowid

    for item in cart:
        cursor.execute(
            "INSERT INTO order_items (order_id, item_id, quantity, subtotal) VALUES (%s, %s, %s, %s)",
            (order_id, item['id'], item['quantity'], item['price'] * item['quantity'])
        )

    conn.commit()
    cursor.close()
    conn.close()

    session['cart'] = []
    session.modified = True

    return render_template(
        'order_success.html',
        user=user,
        total=total,
        order_id=order_id,
        eta='20-30 minutes',
        is_logged_in=True
    )

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'success')
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True)