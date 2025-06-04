class EcommerceBebidas {
    constructor() {
        this.products = [];
        this.cart = [];
        this.currentEditingId = null;
        this.init();
    }

    init() {
        this.loadInitialData();
        this.bindEvents();
        this.renderProducts();
        this.updateDashboard();
        this.renderAdminTable();
    }

    loadInitialData() {
        this.products = [
            {
                id: 1,
                name: "Vinho Tinto Reserva",
                category: "vinho",
                price: 89.90,
                stock: 25,
                description: "Vinho tinto encorpado com notas de frutas vermelhas",
                image: "vinho01.jpg",
                alcohol: 13.5,
                volume: 750
            },
            {
                id: 2,
                name: "Cerveja Artesanal IPA",
                category: "cerveja",
                price: 12.50,
                stock: 48,
                description: "Cerveja India Pale Ale com lúpulo americano",
                image: "ipa.webp",
                alcohol: 5.8,
                volume: 355
            },
            {
                id: 3,
                name: "Whisky Single Malt",
                category: "destilado",
                price: 299.90,
                stock: 8,
                description: "Whisky escocês envelhecido por 12 anos",
                image: "WH-DALMORE-15-SINGLE-MALT-SCOTCH.png",
                alcohol: 40,
                volume: 750
            },
            {
                id: 4,
                name: "Água Mineral Premium",
                category: "nao-alcoolico",
                price: 4.99,
                stock: 120,
                description: "Água mineral natural sem gás",
                image: "agua-sem-gas.png",
                alcohol: 0,
                volume: 500
            },
            {
                id: 5,
                name: "Champagne Brut",
                category: "vinho",
                price: 159.90,
                stock: 15,
                description: "Espumante francês método tradicional",
                image: "1631000-standing-front.png",
                alcohol: 12,
                volume: 750
            },
            {
                id: 6,
                name: "Cachaça Premium",
                category: "destilado",
                price: 45.90,
                stock: 32,
                description: "Cachaça artesanal envelhecida em carvalho",
                image: "cachaca-guaraciaba-extra-premium-carvalho-americano-750ml-01425_1.webp",
                alcohol: 39,
                volume: 700
            }
        ];
    }

    bindEvents() {
        document.getElementById('add-product-btn').addEventListener('click', () => this.openProductModal());
        document.getElementById('product-form').addEventListener('submit', (e) => this.handleProductSubmit(e));
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeProductModal());
        document.querySelector('.modal-close').addEventListener('click', () => this.closeProductModal());
        document.getElementById('confirm-cancel').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirm-ok').addEventListener('click', () => this.handleConfirmAction());
        
        document.getElementById('category-filter').addEventListener('change', () => this.filterProducts());
        document.getElementById('price-filter').addEventListener('change', () => this.filterProducts());
        document.getElementById('search-btn').addEventListener('click', () => this.filterProducts());
        
        document.querySelector('.cart-btn').addEventListener('click', () => this.toggleCart());
        document.querySelector('.cart-close').addEventListener('click', () => this.closeCart());
        document.getElementById('checkout-btn').addEventListener('click', () => this.handleCheckout());
        
        document.getElementById('refresh-dashboard').addEventListener('click', () => this.updateDashboard());
        document.getElementById('export-report').addEventListener('click', () => this.exportReport());
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        document.querySelector('.cta-button').addEventListener('click', () => {
            document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
        });
    }

    openProductModal(productId = null) {
        const modal = document.getElementById('product-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('product-form');
        
        if (productId) {
            const product = this.products.find(p => p.id === productId);
            title.textContent = 'Editar Produto';
            this.fillProductForm(product);
            this.currentEditingId = productId;
        } else {
            title.textContent = 'Adicionar Produto';
            form.reset();
            this.clearFormErrors();
            this.currentEditingId = null;
        }
        
        this.showModal(modal);
    }

    closeProductModal() {
        const modal = document.getElementById('product-modal');
        this.hideModal(modal);
        this.clearFormErrors();
        this.currentEditingId = null;
    }

    fillProductForm(product) {
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-image').value = product.image || '';
        document.getElementById('product-alcohol').value = product.alcohol || '';
        document.getElementById('product-volume').value = product.volume || '';
    }

    handleProductSubmit(e) {
        e.preventDefault();
        
        if (!this.validateProductForm()) {
            return;
        }

        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name').trim(),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            description: formData.get('description').trim(),
            image: formData.get('image').trim(),
            alcohol: parseFloat(formData.get('alcohol')) || 0,
            volume: parseInt(formData.get('volume')) || 0
        };

        if (this.currentEditingId) {
            this.updateProduct(this.currentEditingId, productData);
        } else {
            this.addProduct(productData);
        }

        this.closeProductModal();
        this.showToast('Produto salvo com sucesso!', 'success');
    }

    validateProductForm() {
        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('product-category').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value);

        let isValid = true;

        this.clearFormErrors();

        if (!name) {
            this.showFieldError('name-error', 'Nome é obrigatório');
            isValid = false;
        }

        if (!category) {
            this.showFieldError('category-error', 'Categoria é obrigatória');
            isValid = false;
        }

        if (isNaN(price) || price <= 0) {
            this.showFieldError('price-error', 'Preço deve ser maior que zero');
            isValid = false;
        }

        if (isNaN(stock) || stock < 0) {
            this.showFieldError('stock-error', 'Estoque deve ser maior ou igual a zero');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(errorId, message) {
        document.getElementById(errorId).textContent = message;
    }

    clearFormErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => el.textContent = '');
    }

    addProduct(productData) {
        const newId = Math.max(...this.products.map(p => p.id), 0) + 1;
        const newProduct = { id: newId, ...productData };
        this.products.push(newProduct);
        this.renderProducts();
        this.renderAdminTable();
        this.updateDashboard();
    }

    updateProduct(id, productData) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { id, ...productData };
            this.renderProducts();
            this.renderAdminTable();
            this.updateDashboard();
        }
    }

    deleteProduct(id) {
        this.confirmAction(`Tem certeza que deseja excluir este produto?`, () => {
            this.products = this.products.filter(p => p.id !== id);
            this.cart = this.cart.filter(item => item.id !== id);
            this.renderProducts();
            this.renderAdminTable();
            this.updateDashboard();
            this.updateCartUI();
            this.showToast('Produto excluído com sucesso!', 'success');
        });
    }

    renderProducts() {
        const container = document.getElementById('products-grid');
        const categoryFilter = document.getElementById('category-filter').value;
        const priceFilter = document.getElementById('price-filter').value;
        
        let filteredProducts = this.products;

        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
        }

        if (priceFilter) {
            const [min, max] = this.parsePriceRange(priceFilter);
            filteredProducts = filteredProducts.filter(p => {
                if (max === Infinity) return p.price >= min;
                return p.price >= min && p.price <= max;
            });
        }

        container.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦 Imagem não disponível'}
                </div>
                <div class="product-info">
                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                    <div class="product-stock">Estoque: ${product.stock} unidades</div>
                    <div class="product-actions">
                        <button class="btn primary-btn" onclick="ecommerce.addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? 'Esgotado' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    parsePriceRange(range) {
        switch (range) {
            case '0-50': return [0, 50];
            case '50-100': return [50, 100];
            case '100-200': return [100, 200];
            case '200+': return [200, Infinity];
            default: return [0, Infinity];
        }
    }

    getCategoryName(category) {
        const names = {
            'vinho': 'Vinho',
            'cerveja': 'Cerveja',
            'destilado': 'Destilado',
            'nao-alcoolico': 'Não Alcoólico'
        };
        return names[category] || category;
    }

    filterProducts() {
        this.renderProducts();
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || product.stock === 0) {
            this.showToast('Produto indisponível', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
                this.showToast('Quantidade atualizada no carrinho', 'success');
            } else {
                this.showToast('Estoque insuficiente', 'warning');
                return;
            }
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
            this.showToast('Produto adicionado ao carrinho', 'success');
        }

        this.updateCartUI();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartUI();
        this.showToast('Produto removido do carrinho', 'success');
    }

    updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        const product = this.products.find(p => p.id === productId);
        
        if (item && product) {
            const newQuantity = item.quantity + change;
            
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            
            if (newQuantity <= product.stock) {
                item.quantity = newQuantity;
                this.updateCartUI();
            } else {
                this.showToast('Estoque insuficiente', 'warning');
            }
        }
    }

    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        cartCount.textContent = totalItems;
        cartTotal.textContent = `R$ ${totalValue.toFixed(2)}`;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Carrinho vazio</div>';
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '📦'}
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="ecommerce.updateCartQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="ecommerce.updateCartQuantity(${item.id}, 1)">+</button>
                            <button class="btn danger-btn btn-small" onclick="ecommerce.removeFromCart(${item.id})">Remover</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('modal-overlay');
        
        cartSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('modal-overlay');
        
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    handleCheckout() {
        if (this.cart.length === 0) {
            this.showToast('Carrinho vazio', 'warning');
            return;
        }

        const totalValue = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        this.confirmAction(`Finalizar compra no valor de R$ ${totalValue.toFixed(2)}?`, () => {
            this.cart.forEach(item => {
                const product = this.products.find(p => p.id === item.id);
                if (product) {
                    product.stock -= item.quantity;
                }
            });
            
            this.cart = [];
            this.updateCartUI();
            this.renderProducts();
            this.renderAdminTable();
            this.updateDashboard();
            this.closeCart();
            this.showToast('Compra finalizada com sucesso!', 'success');
        });
    }

    renderAdminTable() {
        const tbody = document.getElementById('admin-table-body');
        
        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <img src="${product.image || ''}" alt="${product.name}" class="product-image-small" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                    <span style="display: none;">📦</span>
                </td>
                <td>${product.name}</td>
                <td>${this.getCategoryName(product.category)}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(product.stock)}">
                        ${this.getStatusText(product.stock)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn primary-btn btn-small" onclick="ecommerce.openProductModal(${product.id})">
                            Editar
                        </button>
                        <button class="btn danger-btn btn-small" onclick="ecommerce.deleteProduct(${product.id})">
                            Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getStatusClass(stock) {
        if (stock === 0) return 'status-out-of-stock';
        if (stock <= 10) return 'status-low-stock';
        return 'status-in-stock';
    }

    getStatusText(stock) {
        if (stock === 0) return 'Esgotado';
        if (stock <= 10) return 'Estoque Baixo';
        return 'Em Estoque';
    }

    updateDashboard() {
        const totalProducts = this.products.length;
        const inStock = this.products.filter(p => p.stock > 0).length;
        const outOfStock = this.products.filter(p => p.stock === 0).length;
        const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('in-stock').textContent = inStock;
        document.getElementById('out-of-stock').textContent = outOfStock;
        document.getElementById('total-value').textContent = `R$ ${totalValue.toFixed(2)}`;
        
        this.updateLowStockList();
        this.updateCharts();
    }

    updateLowStockList() {
        const lowStockList = document.getElementById('low-stock-list');
        const lowStockProducts = this.products.filter(p => p.stock <= 10 && p.stock > 0);
        
        if (lowStockProducts.length === 0) {
            lowStockList.innerHTML = '<div class="low-stock-item">Nenhum produto com estoque baixo</div>';
        } else {
            lowStockList.innerHTML = lowStockProducts.map(product => `
                <div class="low-stock-item">
                    <span>${product.name}</span>
                    <span>${product.stock} unidades</span>
                </div>
            `).join('');
        }
    }

    updateCharts() {
        this.renderCategoryChart();
        this.renderSalesChart();
    }

    renderCategoryChart() {
        const canvas = document.getElementById('category-chart');
        const ctx = canvas.getContext('2d');
        
        const categories = {};
        this.products.forEach(product => {
            const categoryName = this.getCategoryName(product.category);
            categories[categoryName] = (categories[categoryName] || 0) + 1;
        });
        
        this.drawPieChart(ctx, categories, canvas.width, canvas.height);
    }

    renderSalesChart() {
        const canvas = document.getElementById('sales-chart');
        const ctx = canvas.getContext('2d');
        
        const salesData = {
            'Jan': 15000,
            'Fev': 18000,
            'Mar': 22000,
            'Abr': 19000,
            'Mai': 25000,
            'Jun': 23000
        };
        
        this.drawBarChart(ctx, salesData, canvas.width, canvas.height);
    }

    drawPieChart(ctx, data, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        const total = Object.values(data).reduce((sum, value) => sum + value, 0);
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        
        let currentAngle = 0;
        let colorIndex = 0;
        
        Object.entries(data).forEach(([label, value]) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[colorIndex % colors.length];
            ctx.fill();
            
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(value, labelX, labelY);
            
            currentAngle += sliceAngle;
            colorIndex++;
        });
    }

    drawBarChart(ctx, data, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        const margin = 40;
        const chartWidth = width - margin * 2;
        const chartHeight = height - margin * 2;
        
        const maxValue = Math.max(...Object.values(data));
        const barWidth = chartWidth / Object.keys(data).length;
        
        ctx.fillStyle = '#e9ecef';
        ctx.fillRect(margin, margin, chartWidth, chartHeight);
        
        Object.entries(data).forEach(([label, value], index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = margin + index * barWidth + barWidth * 0.1;
            const y = margin + chartHeight - barHeight;
            
            ctx.fillStyle = '#667eea';
            ctx.fillRect(x, y, barWidth * 0.8, barHeight);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + barWidth * 0.4, height - 10);
            ctx.fillText(`R$ ${(value/1000)}k`, x + barWidth * 0.4, y - 5);
        });
    }

    exportReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            totalProducts: this.products.length,
            inStock: this.products.filter(p => p.stock > 0).length,
            outOfStock: this.products.filter(p => p.stock === 0).length,
            totalValue: this.products.reduce((sum, p) => sum + (p.price * p.stock), 0),
            products: this.products
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `relatorio-estoque-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Relatório exportado com sucesso!', 'success');
    }

    confirmAction(message, callback) {
        const modal = document.getElementById('confirm-modal');
        const messageEl = document.getElementById('confirm-message');
        
        messageEl.textContent = message;
        this.showModal(modal);
        
        this.pendingConfirmAction = callback;
    }

    handleConfirmAction() {
        if (this.pendingConfirmAction) {
            this.pendingConfirmAction();
            this.pendingConfirmAction = null;
        }
        this.closeConfirmModal();
    }

    closeConfirmModal() {
        const modal = document.getElementById('confirm-modal');
        this.hideModal(modal);
        this.pendingConfirmAction = null;
    }

    showModal(modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => this.hideModal(modal));
        this.closeCart();
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showLoading() {
        const spinner = document.getElementById('loading-spinner');
        spinner.classList.add('active');
        spinner.setAttribute('aria-hidden', 'false');
    }

    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        spinner.classList.remove('active');
        spinner.setAttribute('aria-hidden', 'true');
    }
}

const ecommerce = new EcommerceBebidas();

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('section[id]').forEach(section => {
        observer.observe(section);
    });
});