export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  fullContent: string; // Full article content
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  coverImage?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 100,
    title: "GitHub OIDC → AWS (No Long-Lived Keys): Cloud Automation the Right Way",
    excerpt:
      "How to use GitHub Actions OIDC to assume an AWS IAM role and deploy/upload artifacts without storing AWS keys. Includes least-privilege IAM, trust policy patterns, and troubleshooting tips.",
    content: "How to use GitHub Actions OIDC to assume AWS roles without static keys...",
    fullContent: `
# GitHub OIDC → AWS (No Long-Lived Keys): Cloud Automation the Right Way

Static AWS keys in CI are a footgun.

If you want cloud automation that scales (and passes security review), use **OIDC-based federation**:

- GitHub Actions issues a short-lived identity token (OIDC)
- AWS STS exchanges it for short-lived AWS credentials
- Your workflow assumes a least-privilege role and does the work

This portfolio uses the same pattern to support **Cloud telemetry mode** (AWS S3) without ever embedding long-lived credentials.

## The architecture

\`GitHub Actions\` → OIDC token → \`AWS STS AssumeRoleWithWebIdentity\` → IAM Role → S3 write

## Why this matters

- No credential rotation
- Blast radius is smaller (short-lived creds)
- Easy to lock down by repo/branch/environment

## What I shipped in this portfolio

- Terraform module that provisions S3 + IAM role with an OIDC trust policy
- A GitHub workflow that uploads a metrics artifact to S3
- A dashboard mode that reads from S3 (with safe fallback)

## Takeaway

If you’re building cloud automation, treat identity as part of the system design.
OIDC + least privilege is the modern baseline.
`,
    category: "Cloud Automation",
    tags: ["AWS", "IAM", "OIDC", "GitHub Actions", "Terraform", "Security"],
    date: "2026-01-10",
    readTime: "10 min read",
    coverImage: "/images/blog/blog-100-cover.png",
  },
  {
    id: 1,
    title: "Building a Production-Ready API Testing Framework",
    excerpt: "Learn how I built an API testing framework that reduced flaky tests from 10% to <1% using intelligent retry logic, Pydantic validation, and session pooling.",
    content: "Deep dive into architecting a robust API testing framework with Python, pytest, and Requests...",
    fullContent: `
# Building a Production-Ready API Testing Framework

After years of battling flaky API tests in CI/CD pipelines, I finally cracked the code. Here's how I built a framework that reduced our flaky test rate from 10% to less than 1%.

## The Problem

When I joined the team, our API test suite was a nightmare:
- **10% flaky test rate** - Tests randomly failed in CI
- **Network issues** caused false positives
- **Rate limiting** (429 errors) killed entire test runs
- **No schema validation** - API changes broke silently
- **45-minute execution time** - Blocked deployments
- **Secrets leaked** in CI logs (security nightmare)

## The Solution: Layered Architecture

I designed a three-layer architecture that separated concerns and made tests maintainable:

\`\`\`python
# Layer 1: HTTP Client with Connection Pooling
class APIClient:
    def __init__(self, base_url: str):
        self.session = requests.Session()
        adapter = HTTPAdapter(
            pool_connections=10,
            pool_maxsize=100,
            max_retries=0  # We handle retries ourselves
        )
        self.session.mount('http://', adapter)
        self.session.mount('https://', adapter)
    
    def close(self):
        self.session.close()
\`\`\`

**Why connection pooling?** It reduced our test execution time by 3x. Instead of creating a new TCP connection for every request, we reuse connections.

\`\`\`python
# Layer 2: Intelligent Retry Logic
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout)),
    reraise=True
)
def make_request(method: str, url: str, **kwargs):
    response = requests.request(method, url, **kwargs)
    
    # Smart retry on specific status codes
    if response.status_code == 429:  # Rate limit
        time.sleep(5)
        raise requests.exceptions.RetryError("Rate limited")
    
    if 500 <= response.status_code < 600:  # Server errors
        raise requests.exceptions.RetryError("Server error")
    
    return response
\`\`\`

**Key insight:** Not all failures should trigger retries. We only retry on:
- Network errors (connection refused, timeouts)
- Rate limits (429)
- Server errors (5xx)

We **never** retry on client errors (4xx) because those indicate real problems with our tests.

\`\`\`python
# Layer 3: Pydantic Schema Validation
from pydantic import BaseModel, Field

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: str
    
    class Config:
        extra = "forbid"  # Fail if API returns unexpected fields

def test_get_user():
    response = api.get("/users/123")
    assert response.status_code == 200
    
    # This will fail if API structure changes
    user = UserResponse(**response.json())
    assert user.email == "test@example.com"
\`\`\`

**Why Pydantic?** Type-safe validation catches API breaking changes immediately. The \`extra="forbid"\` setting is crucial - it fails if the API adds unexpected fields, alerting us to changes.

## Handling Secrets Safely

One of our biggest security issues was secrets leaking in CI logs. Here's how I fixed it:

\`\`\`python
import os
from dataclasses import dataclass

@dataclass
class TestConfig:
    api_key: str = os.getenv("API_KEY", "")
    base_url: str = os.getenv("BASE_URL", "http://localhost:8000")
    
    def __repr__(self):
        return f"TestConfig(api_key='***REDACTED***', base_url='{self.base_url}')"

# Custom Pytest plugin to sanitize logs
@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    
    if report.longrepr:
        # Redact secrets from error messages
        report.longrepr = redact_secrets(str(report.longrepr))
\`\`\`

## Session Fixtures for Speed

Using pytest fixtures properly made tests 3x faster:

\`\`\`python
@pytest.fixture(scope="session")
def api_client():
    """Reuse same client for entire test session"""
    client = APIClient(base_url=os.getenv("API_URL"))
    yield client
    client.close()

@pytest.fixture(scope="function")
def auth_headers(api_client):
    """Get fresh auth token for each test"""
    response = api_client.post("/auth/token", 
        data={"username": "test", "password": "test"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
\`\`\`

**Scope matters:** Session-scoped fixtures (API client) are created once. Function-scoped fixtures (auth tokens) are fresh for each test.

## Real-World Test Example

Here's what a complete test looks like with all layers:

\`\`\`python
def test_create_order_workflow(api_client, auth_headers):
    # 1. Create a product
    product_data = {
        "name": "Test Product",
        "price": 29.99,
        "stock": 100
    }
    response = api_client.post("/products", 
        json=product_data, 
        headers=auth_headers
    )
    assert response.status_code == 201
    product = ProductResponse(**response.json())
    
    # 2. Create an order
    order_data = {
        "product_id": product.id,
        "quantity": 2
    }
    response = api_client.post("/orders", 
        json=order_data, 
        headers=auth_headers
    )
    assert response.status_code == 201
    order = OrderResponse(**response.json())
    
    # 3. Verify order total
    assert order.total == product.price * order_data["quantity"]
    
    # 4. Verify inventory reduced
    response = api_client.get(f"/products/{product.id}")
    updated_product = ProductResponse(**response.json())
    assert updated_product.stock == 98
\`\`\`

## Results

After implementing this framework:

- ✅ **Flaky test rate: 10% → <1%**
- ✅ **125+ API tests** with comprehensive coverage
- ✅ **3x faster execution** (45 min → 15 min)
- ✅ **Zero secret leakage** in 6+ months
- ✅ **Prevented 12 breaking changes** from reaching production

## Key Takeaways

1. **Connection pooling is mandatory** for API tests
2. **Smart retries** - Don't retry everything
3. **Pydantic validation** catches breaking changes early
4. **Pytest fixtures with proper scope** = massive speed gains
5. **Security first** - Redact secrets everywhere

## Next Steps

Want to implement this in your org? Start with:
1. Add connection pooling to your HTTP client
2. Implement exponential backoff on network errors only
3. Add schema validation with Pydantic
4. Audit your logs for leaked secrets

The investment in a solid foundation pays off every single day.

---

**Questions?** Reach out on LinkedIn or check out the full framework on GitHub.
`,
    category: "API Testing",
    tags: ["Python", "API Testing", "pytest", "Pydantic"],
    date: "2024-01-15",
    readTime: "12 min read",
    coverImage: "/images/blog/blog-1-cover.png",
  },
  {
    id: 2,
    title: "Page Object Model: Beyond the Basics",
    excerpt: "Most teams implement POM wrong. Here's how to build a truly maintainable Selenium framework that scales to hundreds of tests.",
    content: "Advanced patterns for Page Object Model including dynamic locators, component composition, and testing strategies...",
    fullContent: `
# Page Object Model: Beyond the Basics

Most Selenium frameworks I've seen use Page Object Model, but they're doing it wrong. After building frameworks for The Home Depot (2,300+ stores) and maintaining 300+ tests, here's what actually works.

## The Standard POM Problem

Everyone starts with the textbook POM example:

\`\`\`python
class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self.username_field = (By.ID, "username")
        self.password_field = (By.ID, "password")
        self.login_button = (By.ID, "login")
    
    def login(self, username, password):
        self.driver.find_element(*self.username_field).send_keys(username)
        self.driver.find_element(*self.password_field).send_keys(password)
        self.driver.find_element(*self.login_button).click()
\`\`\`

This looks clean, but it has serious problems:
- **Brittle locators** - IDs change, tests break
- **No waits** - Race conditions everywhere
- **Duplicate code** - Every page re-implements basic interactions
- **Hard to test** - Can't test page objects in isolation
- **Tight coupling** - Changes ripple through entire framework

## The Better Way: Component Composition

After years of maintenance hell, I redesigned our framework using composition:

\`\`\`python
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

class BaseComponent:
    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)
    
    def find(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def click(self, locator):
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()
    
    def type(self, locator, text):
        element = self.find(locator)
        element.clear()
        element.send_keys(text)
    
    def get_text(self, locator):
        return self.find(locator).text

class InputField(BaseComponent):
    def __init__(self, driver, locator):
        super().__init__(driver)
        self.locator = locator
    
    def fill(self, text):
        self.type(self.locator, text)
    
    def clear(self):
        self.find(self.locator).clear()

class Button(BaseComponent):
    def __init__(self, driver, locator):
        super().__init__(driver)
        self.locator = locator
    
    def click(self):
        super().click(self.locator)
    
    def is_enabled(self):
        return self.find(self.locator).is_enabled()
\`\`\`

Now pages compose these reusable components:

\`\`\`python
class LoginPage(BaseComponent):
    def __init__(self, driver):
        super().__init__(driver)
        self.username = InputField(driver, (By.ID, "username"))
        self.password = InputField(driver, (By.ID, "password"))
        self.login_btn = Button(driver, (By.ID, "login"))
    
    def login(self, username, password):
        self.username.fill(username)
        self.password.fill(password)
        self.login_btn.click()
        return DashboardPage(self.driver)
\`\`\`

**Benefits:**
- Built-in waits in every component
- Reusable across all pages
- Easy to test components in isolation
- Single place to fix wait logic

## Dynamic Locators: The Game Changer

Static locators break when UI changes. Use dynamic locators instead:

\`\`\`python
class DynamicLocators:
    @staticmethod
    def product_by_name(product_name):
        return (By.XPATH, f"//div[@class='product'][.//h3[text()='{product_name}']]")
    
    @staticmethod
    def button_by_text(text):
        return (By.XPATH, f"//button[text()='{text}']")
    
    @staticmethod
    def row_by_id(row_id):
        return (By.CSS_SELECTOR, f"tr[data-id='{row_id}']")

class ProductPage(BaseComponent):
    def select_product(self, name):
        locator = DynamicLocators.product_by_name(name)
        self.click(locator)
    
    def click_button(self, text):
        locator = DynamicLocators.button_by_text(text)
        self.click(locator)
\`\`\`

This saved us hundreds of hours when The Home Depot redesigned their UI.

## Handling Complex Interactions

Real apps have modals, dropdowns, and dynamic content. Here's how to handle them:

\`\`\`python
class Dropdown(BaseComponent):
    def __init__(self, driver, locator):
        super().__init__(driver)
        self.locator = locator
    
    def select_by_text(self, text):
        self.click(self.locator)
        option = (By.XPATH, f"//li[text()='{text}']")
        self.click(option)
    
    def get_selected(self):
        return self.get_text(self.locator)

class Modal(BaseComponent):
    def __init__(self, driver):
        super().__init__(driver)
        self.overlay = (By.CLASS_NAME, "modal-overlay")
        self.close_btn = (By.CLASS_NAME, "modal-close")
    
    def wait_for_modal(self):
        self.wait.until(EC.visibility_of_element_located(self.overlay))
    
    def close(self):
        self.click(self.close_btn)
        self.wait.until(EC.invisibility_of_element_located(self.overlay))

class CheckoutPage(BaseComponent):
    def __init__(self, driver):
        super().__init__(driver)
        self.country_dropdown = Dropdown(driver, (By.ID, "country"))
        self.confirmation_modal = Modal(driver)
    
    def select_country(self, country):
        self.country_dropdown.select_by_text(country)
    
    def confirm_order(self):
        self.click((By.ID, "confirm-btn"))
        self.confirmation_modal.wait_for_modal()
        self.confirmation_modal.close()
\`\`\`

## Testing Strategy

Page objects should be testable without Selenium:

\`\`\`python
class LoginPage(BaseComponent):
    def __init__(self, driver):
        super().__init__(driver)
        self.username = InputField(driver, (By.ID, "username"))
        self.password = InputField(driver, (By.ID, "password"))
        self.login_btn = Button(driver, (By.ID, "login"))
        self.error_msg = (By.CLASS_NAME, "error")
    
    def login(self, username, password):
        self.username.fill(username)
        self.password.fill(password)
        self.login_btn.click()
        return DashboardPage(self.driver)
    
    def get_error_message(self):
        try:
            return self.get_text(self.error_msg)
        except TimeoutException:
            return None

# Test
def test_login_success(driver):
    login_page = LoginPage(driver)
    dashboard = login_page.login("valid_user", "valid_pass")
    assert dashboard.is_loaded()

def test_login_failure(driver):
    login_page = LoginPage(driver)
    login_page.login("invalid", "invalid")
    assert login_page.get_error_message() == "Invalid credentials"
\`\`\`

## Performance Optimization

Page objects can slow tests down if not optimized:

\`\`\`python
class BasePage(BaseComponent):
    def __init__(self, driver):
        super().__init__(driver)
        self._page_loaded = False
    
    def wait_for_page_load(self):
        if self._page_loaded:
            return
        
        # Wait for DOM ready
        self.wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        
        # Wait for AJAX
        self.wait.until(lambda d: d.execute_script("return jQuery.active == 0"))
        
        self._page_loaded = True
    
    def is_loaded(self):
        try:
            self.wait_for_page_load()
            return True
        except TimeoutException:
            return False
\`\`\`

## Real-World Example: E-Commerce Flow

Here's a complete checkout flow using our framework:

\`\`\`python
def test_complete_purchase_flow(driver):
    # Login
    login = LoginPage(driver)
    dashboard = login.login("test@example.com", "password")
    assert dashboard.is_loaded()
    
    # Browse products
    products = dashboard.goto_products()
    products.select_category("Electronics")
    products.select_product("Laptop")
    
    # Add to cart
    product_detail = ProductDetailPage(driver)
    product_detail.select_quantity(2)
    product_detail.add_to_cart()
    
    # Checkout
    cart = product_detail.goto_cart()
    assert cart.get_item_count() == 2
    
    checkout = cart.proceed_to_checkout()
    checkout.select_country("United States")
    checkout.enter_payment_info({
        "card_number": "4111111111111111",
        "expiry": "12/25",
        "cvv": "123"
    })
    
    # Confirm
    confirmation = checkout.place_order()
    assert confirmation.get_order_number() is not None
    assert confirmation.get_message() == "Order placed successfully"
\`\`\`

## Key Takeaways

1. **Composition over inheritance** - Build reusable components
2. **Dynamic locators** - Adapt to UI changes easily
3. **Built-in waits** - Every component waits intelligently
4. **Testability** - Page objects should be easy to test
5. **Performance** - Cache page load states

## Results at The Home Depot

After implementing these patterns:
- ✅ **Test maintenance time: 8 hours/week → 2 hours/week**
- ✅ **300+ tests with 99.5% stability**
- ✅ **UI redesign took 2 days to fix, not 2 weeks**
- ✅ **New team members productive in 3 days**

The investment in proper POM architecture pays off every single sprint.

---

**Questions?** Check out the complete framework on GitHub or reach out on LinkedIn!
`,
    category: "Selenium",
    tags: ["Selenium", "Python", "Design Patterns", "POM"],
    date: "2024-01-10",
    readTime: "15 min read",
    coverImage: "/images/blog/blog-2-cover.png",
  },
  {
    id: 3,
    title: "Fixing Docker Compose Connection Errors in CI/CD",
    excerpt: "Spent 4 hours debugging 'Connection refused' errors in Jenkins. Here's what I learned about Docker networking in CI pipelines.",
    content: "Troubleshooting guide for Docker Compose networking issues in Jenkins CI/CD pipelines...",
    fullContent: `
# Fixing Docker Compose Connection Errors in CI/CD

Picture this: Your Docker Compose setup works perfectly on your local machine. You push to Jenkins, and suddenly: \`Connection refused\`. Sound familiar?

I spent 4 hours debugging this exact issue. Here's everything I learned so you don't have to.

## The Problem

Our test suite uses Docker Compose to spin up dependencies:

\`\`\`yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: test
    ports:
      - "5432:5432"
\`\`\`

**On local machine:** Tests pass ✅  
**In Jenkins:** \`Connection refused on localhost:8000\` ❌

## Why It Fails in CI

The issue is **networking context**. When you run \`docker-compose up\` locally, services are accessible on \`localhost\`. But in CI:

1. Jenkins runs in its own Docker container
2. Your tests run in yet another container
3. Services run in their own network
4. **\`localhost\` means different things in each context**

## The Fix: Use Service Names

Instead of connecting to \`localhost:8000\`, connect to \`api:8000\`:

\`\`\`python
# ❌ WRONG - Works locally, fails in CI
API_URL = "http://localhost:8000"

# ✅ RIGHT - Works everywhere
API_URL = os.getenv("API_URL", "http://api:8000")
\`\`\`

Docker Compose creates a network where services can reach each other by name.

## Health Checks Are Mandatory

\`depends_on\` doesn't wait for services to be ready. It only waits for containers to start.

Add health checks:

\`\`\`yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 5s
      timeout: 3s
      retries: 5
  
  db:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: test
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
\`\`\`

## Jenkins-Specific Issues

### Issue 1: Port Conflicts

Jenkins might already have something on port 5432. Use random ports:

\`\`\`yaml
services:
  db:
    image: postgres:14
    ports:
      - "0:5432"  # Assigns random available port
\`\`\`

### Issue 2: Network Cleanup

Old networks from failed builds persist. Clean up before each run:

\`\`\`bash
#!/bin/bash
# In Jenkinsfile or build script
docker-compose down --volumes --remove-orphans
docker network prune -f
docker-compose up -d
\`\`\`

### Issue 3: Container Permissions

Jenkins user might not have Docker permissions:

\`\`\`groovy
// Jenkinsfile
pipeline {
    agent {
        docker {
            image 'docker:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock --group-add docker'
        }
    }
}
\`\`\`

## Full Working Example

Here's a complete setup that works in CI:

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:test@db:5432/testdb
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 5s
      timeout: 3s
      retries: 10
    networks:
      - test-network
  
  tests:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      API_URL: http://api:8000
    depends_on:
      api:
        condition: service_healthy
    networks:
      - test-network
  
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_PASSWORD: test
      POSTGRES_DB: testdb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
    tmpfs:
      - /var/lib/postgresql/data
    networks:
      - test-network

networks:
  test-network:
    driver: bridge
\`\`\`

\`\`\`bash
# run-tests.sh
#!/bin/bash
set -e

echo "Cleaning up old containers..."
docker-compose down --volumes --remove-orphans

echo "Starting services..."
docker-compose up -d --build

echo "Running tests..."
docker-compose run --rm tests pytest

echo "Collecting logs..."
docker-compose logs > test-logs.txt

echo "Cleaning up..."
docker-compose down --volumes
\`\`\`

## Debugging Tips

When things still don't work:

\`\`\`bash
# 1. Check if services are actually running
docker-compose ps

# 2. Check service logs
docker-compose logs api

# 3. Test connectivity from tests container
docker-compose run --rm tests curl http://api:8000/health

# 4. Inspect the network
docker network inspect \$(docker-compose ps -q api | xargs docker inspect -f '{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}')

# 5. Check DNS resolution
docker-compose run --rm tests nslookup api
\`\`\`

## Key Takeaways

1. **Never use \`localhost\` in Docker Compose** - Use service names
2. **Health checks are mandatory** - \`depends_on\` isn't enough
3. **Clean up between runs** - Old networks cause issues
4. **Use tmpfs for databases** - Faster tests, no disk I/O
5. **Always collect logs** - Essential for debugging CI failures

## My Results

After implementing these fixes:
- ✅ **100% consistent builds** (was 60% before)
- ✅ **45 minutes → 8 minutes** test time
- ✅ **Zero "connection refused" errors** in 6 months
- ✅ **Easy to debug** when issues do occur

The secret is treating Docker networking as a first-class concern, not an afterthought.

---

**Still stuck?** Drop me a message - I've probably seen your specific error before.
`,
    category: "CI/CD",
    tags: ["Docker", "Jenkins", "CI/CD", "Troubleshooting"],
    date: "2024-01-05",
    readTime: "8 min read",
    coverImage: "/images/blog/blog-3-cover.png",
  },
  {
    id: 4,
    title: "Performance Testing: From Zero to Production",
    excerpt: "How I built a performance testing suite that identified 3 critical bottlenecks before production and improved API response times by 40%.",
    content: "Complete guide to load testing with Locust and JMeter, including baseline establishment and CI integration...",
    fullContent: `
# Performance Testing: From Zero to Production

When I joined a fintech startup processing $10M+ daily volume, they had zero performance testing. Here's how I built a comprehensive load testing suite that saved us from multiple production disasters.

## The Wake-Up Call

Three months into production, our trading platform crashed during market open:
- **500+ users** hit the API simultaneously
- **Response times: 200ms → 45 seconds**
- **Database connections maxed out**
- **$2M in potential trades lost**

We had no idea what our capacity limits were. I was tasked with fixing this.

## Phase 1: Establishing Baselines

Before load testing, you need to know normal behavior:

\`\`\`python
# baseline_test.py
from locust import HttpUser, task, between

class BaselineUser(HttpUser):
    wait_time = between(1, 2)
    
    @task
    def get_market_data(self):
        self.client.get("/api/market-data")
    
    @task
    def place_order(self):
        self.client.post("/api/orders", json={
            "symbol": "AAPL",
            "quantity": 100,
            "type": "MARKET"
        })
\`\`\`

**Run baseline with 1 user:**

\`\`\`bash
locust -f baseline_test.py --users 1 --spawn-rate 1 --run-time 5m --headless
\`\`\`

**Results:**
- GET /market-data: 45ms (p95)
- POST /orders: 120ms (p95)

These became our performance SLIs.

## Phase 2: Load Testing Strategy

I designed a three-tier testing approach:

### Tier 1: Smoke Test (1-10 users)
Quick sanity check - does the system work under minimal load?

\`\`\`python
# smoke_test.py
class SmokeTest(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login once per user
        response = self.client.post("/api/auth/login", json={
            "username": f"user{self.environment.runner.user_count}",
            "password": "test123"
        })
        self.token = response.json()["token"]
    
    @task(3)
    def browse_market(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/market-data", headers=headers)
    
    @task(1)
    def check_portfolio(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/portfolio", headers=headers)
\`\`\`

### Tier 2: Load Test (Expected Peak)
Simulate expected peak traffic:

\`\`\`python
# load_test.py
class LoadTest(HttpUser):
    wait_time = between(0.5, 2)
    
    @task(5)
    def get_market_data(self):
        self.client.get("/api/market-data")
    
    @task(3)
    def get_quotes(self):
        symbols = ["AAPL", "GOOGL", "MSFT", "TSLA"]
        for symbol in symbols:
            self.client.get(f"/api/quotes/{symbol}")
    
    @task(1)
    def place_order(self):
        self.client.post("/api/orders", json={
            "symbol": random.choice(["AAPL", "GOOGL"]),
            "quantity": random.randint(1, 100),
            "type": "LIMIT",
            "price": random.uniform(100, 200)
        })
\`\`\`

**Run with 500 concurrent users:**

\`\`\`bash
locust -f load_test.py --users 500 --spawn-rate 50 --run-time 10m --headless
\`\`\`

### Tier 3: Stress Test (Beyond Capacity)
Find the breaking point:

\`\`\`python
# stress_test.py
# Gradually ramp up users until system breaks
class StressTest(HttpUser):
    wait_time = between(0.1, 0.5)  # Aggressive timing
    
    @task
    def hammer_api(self):
        with self.client.get("/api/market-data", catch_response=True) as response:
            if response.elapsed.total_seconds() > 5:
                response.failure(f"Took {response.elapsed.total_seconds()}s")
\`\`\`

**Run stress test:**

\`\`\`bash
# Ramp from 100 to 2000 users over 20 minutes
locust -f stress_test.py --users 2000 --spawn-rate 100 --run-time 20m
\`\`\`

## What We Discovered

The stress test revealed three critical bottlenecks:

### Bottleneck #1: Database Connection Pool

At 800 concurrent users, we hit the PostgreSQL connection limit:

\`\`\`
FATAL: remaining connection slots are reserved
\`\`\`

**Fix:**

\`\`\`python
# database.py - Before
engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)

# After
engine = create_engine(
    DATABASE_URL,
    pool_size=50,  # Increased
    max_overflow=100,  # Increased
    pool_pre_ping=True,  # Verify connections
    pool_recycle=3600,  # Recycle after 1 hour
)
\`\`\`

**Result:** Capacity increased to 1,500 users.

### Bottleneck #2: Inefficient Queries

Market data endpoint was running 15 queries per request:

\`\`\`sql
-- Before: N+1 query problem
SELECT * FROM stocks WHERE symbol = 'AAPL';
SELECT * FROM prices WHERE stock_id = 1;
SELECT * FROM metrics WHERE stock_id = 1;
-- ... 12 more queries
\`\`\`

**Fix: Use JOINs**

\`\`\`sql
-- After: Single query with JOINs
SELECT s.*, p.*, m.* 
FROM stocks s
LEFT JOIN prices p ON s.id = p.stock_id
LEFT JOIN metrics m ON s.id = m.stock_id
WHERE s.symbol = 'AAPL';
\`\`\`

**Result:** Response time dropped from 450ms → 85ms.

### Bottleneck #3: No Caching

Market data was being fetched from DB on every request.

**Fix: Add Redis caching**

\`\`\`python
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def cache_market_data(timeout=60):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = f"market_data:{args[0]}"  # symbol
            cached = redis_client.get(key)
            
            if cached:
                return json.loads(cached)
            
            result = func(*args, **kwargs)
            redis_client.setex(key, timeout, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache_market_data(timeout=30)
def get_market_data(symbol):
    return db.query(MarketData).filter_by(symbol=symbol).first()
\`\`\`

**Result:** 90% of requests served from cache, response time dropped to 12ms.

## Integrating with CI/CD

Performance tests should run on every deployment:

\`\`\`yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  push:
    branches: [main, staging]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Start services
        run: |
          docker-compose up -d
          sleep 30  # Wait for services
      
      - name: Run smoke test
        run: |
          pip install locust
          locust -f tests/performance/smoke_test.py \\
            --users 10 --spawn-rate 2 --run-time 2m \\
            --headless --host http://localhost:8000
      
      - name: Run load test
        run: |
          locust -f tests/performance/load_test.py \\
            --users 100 --spawn-rate 10 --run-time 5m \\
            --headless --host http://localhost:8000
      
      - name: Check thresholds
        run: python scripts/check_performance_thresholds.py
\`\`\`

**Threshold checking:**

\`\`\`python
# check_performance_thresholds.py
import json
import sys

with open('locust_report.json') as f:
    results = json.load(f)

thresholds = {
    "GET /api/market-data": {"p95": 100, "failure_rate": 0.01},
    "POST /api/orders": {"p95": 200, "failure_rate": 0.01}
}

failed = False
for endpoint, limits in thresholds.items():
    stats = results[endpoint]
    
    if stats["p95_response_time"] > limits["p95"]:
        print(f"❌ {endpoint}: p95 {stats['p95_response_time']}ms > {limits['p95']}ms")
        failed = True
    
    if stats["failure_rate"] > limits["failure_rate"]:
        print(f"❌ {endpoint}: failure rate {stats['failure_rate']} > {limits['failure_rate']}")
        failed = True

sys.exit(1 if failed else 0)
\`\`\`

## JMeter for Complex Scenarios

For some tests, I used JMeter for advanced features:

\`\`\`xml
<!-- trading_scenario.jmx -->
<jmeterTestPlan>
  <ThreadGroup>
    <stringProp name="ThreadGroup.num_threads">500</stringProp>
    <stringProp name="ThreadGroup.ramp_time">60</stringProp>
    
    <HTTPSamplerProxy>
      <stringProp name="HTTPSampler.path">/api/orders</stringProp>
      <stringProp name="HTTPSampler.method">POST</stringProp>
    </HTTPSamplerProxy>
    
    <!-- Add assertions -->
    <ResponseAssertion>
      <collectionProp name="Asserion.test_strings">
        <stringProp>200</stringProp>
      </collectionProp>
    </ResponseAssertion>
  </ThreadGroup>
</jmeterTestPlan>
\`\`\`

## Monitoring During Tests

Critical: Monitor system resources during load tests:

\`\`\`bash
# monitor.sh
#!/bin/bash

while true; do
    echo "=== $(date) ==="
    
    # CPU usage
    top -bn1 | grep "Cpu(s)" | awk '{print "CPU: "$2}'
    
    # Memory
    free -h | grep Mem | awk '{print "Memory: "$3"/"$2}'
    
    # Database connections
    psql -c "SELECT count(*) FROM pg_stat_activity;" | tail -n 2
    
    # Redis memory
    redis-cli INFO memory | grep used_memory_human
    
    sleep 5
done
\`\`\`

## Results

After 3 months of performance optimization:

- ✅ **Capacity: 500 users → 10,000+ concurrent users**
- ✅ **Response time improved by 40%** (450ms → 85ms average)
- ✅ **Found 3 critical bottlenecks before production**
- ✅ **Zero performance-related outages** in 12 months
- ✅ **CI tests catch regressions** before deployment

## Key Lessons

1. **Always establish baselines first** - You can't improve what you don't measure
2. **Test in production-like environments** - Laptop tests mean nothing
3. **Monitor resources during tests** - Know where it breaks and why
4. **Automate performance tests in CI** - Catch regressions early
5. **Start small, scale up** - Smoke → Load → Stress

Performance testing isn't optional for production systems. The cost of finding issues in production is 100x higher than finding them in testing.

---

**Want to see the complete framework?** Check out my Performance-Testing-Framework on GitHub!
`,
    category: "Performance",
    tags: ["Locust", "JMeter", "Performance Testing", "Python"],
    date: "2023-12-28",
    readTime: "14 min read",
    coverImage: "/images/blog/blog-4-cover.png",
  },
  {
    id: 5,
    title: "Mobile Test Automation with Appium: The Complete Guide",
    excerpt: "Built a cross-platform mobile testing framework that reduced regression time from 2 days to 2 hours and found 23 device-specific bugs before release.",
    content: "Comprehensive guide to mobile automation including iOS/Android testing, cloud device farms, and real device vs emulator strategies...",
    fullContent: `
# Mobile Test Automation with Appium: The Complete Guide

Mobile testing is hard. Testing across 15+ device/OS combinations manually? Impossible. Here's how I built an Appium framework that made it manageable.

## The Mobile Testing Problem

Our app needed to work on:
- **iOS:** 14, 15, 16, 17
- **Android:** 10, 11, 12, 13, 14
- **Devices:** iPhone 12/13/14/15, Samsung S21/S22/S23, Pixel 6/7/8

That's **20+ combinations**. Manual testing took 2 days per release.

## Appium Setup: The Foundation

\`\`\`python
# config/capabilities.py
from appium import webdriver

class Capabilities:
    @staticmethod
    def ios_capabilities(device_name="iPhone 14"):
        return {
            "platformName": "iOS",
            "platformVersion": "16.0",
            "deviceName": device_name,
            "automationName": "XCUITest",
            "app": "/path/to/app.ipa",
            "noReset": True,
            "newCommandTimeout": 300
        }
    
    @staticmethod
    def android_capabilities(device_name="Samsung Galaxy S22"):
        return {
            "platformName": "Android",
            "platformVersion": "13.0",
            "deviceName": device_name,
            "automationName": "UiAutomator2",
            "app": "/path/to/app.apk",
            "noReset": True,
            "newCommandTimeout": 300,
            "autoGrantPermissions": True
        }

# conftest.py
import pytest
from appium import webdriver

@pytest.fixture(scope="function")
def driver(request):
    platform = request.config.getoption("--platform")
    
    if platform == "ios":
        caps = Capabilities.ios_capabilities()
    else:
        caps = Capabilities.android_capabilities()
    
    driver = webdriver.Remote("http://localhost:4723/wd/hub", caps)
    yield driver
    driver.quit()
\`\`\`

## Page Object Model for Mobile

Mobile POM is similar to web, but with mobile-specific challenges:

\`\`\`python
# pages/base_page.py
from appium.webdriver.common.mobileby import MobileBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def find_element(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def tap(self, locator):
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()
    
    def send_keys(self, locator, text):
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)
    
    def swipe_up(self, duration=800):
        size = self.driver.get_window_size()
        start_x = size['width'] // 2
        start_y = int(size['height'] * 0.8)
        end_y = int(size['height'] * 0.2)
        self.driver.swipe(start_x, start_y, start_x, end_y, duration)
    
    def is_keyboard_shown(self):
        return self.driver.is_keyboard_shown()
    
    def hide_keyboard(self):
        if self.is_keyboard_shown():
            self.driver.hide_keyboard()

# pages/login_page.py
class LoginPage(BasePage):
    # iOS locators
    IOS_USERNAME = (MobileBy.ACCESSIBILITY_ID, "username_field")
    IOS_PASSWORD = (MobileBy.ACCESSIBILITY_ID, "password_field")
    IOS_LOGIN_BTN = (MobileBy.ACCESSIBILITY_ID, "login_button")
    
    # Android locators
    ANDROID_USERNAME = (MobileBy.ID, "com.app:id/username")
    ANDROID_PASSWORD = (MobileBy.ID, "com.app:id/password")
    ANDROID_LOGIN_BTN = (MobileBy.ID, "com.app:id/login_btn")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.platform = driver.capabilities['platformName']
    
    @property
    def username_field(self):
        return self.IOS_USERNAME if self.platform == 'iOS' else self.ANDROID_USERNAME
    
    @property
    def password_field(self):
        return self.IOS_PASSWORD if self.platform == 'iOS' else self.ANDROID_PASSWORD
    
    @property
    def login_button(self):
        return self.IOS_LOGIN_BTN if self.platform == 'iOS' else self.ANDROID_LOGIN_BTN
    
    def login(self, username, password):
        self.send_keys(self.username_field, username)
        self.send_keys(self.password_field, password)
        self.hide_keyboard()
        self.tap(self.login_button)
        return DashboardPage(self.driver)
\`\`\`

## Cross-Platform Locator Strategy

The biggest challenge: different locators for iOS vs Android.

**Solution: Locator Factory Pattern**

\`\`\`python
# locators/locator_factory.py
class LocatorFactory:
    def __init__(self, platform):
        self.platform = platform
    
    def get_locator(self, ios_locator, android_locator):
        return ios_locator if self.platform == 'iOS' else android_locator
    
    def by_text(self, text):
        if self.platform == 'iOS':
            return (MobileBy.IOS_PREDICATE, f"label == '{text}' OR name == '{text}'")
        else:
            return (MobileBy.ANDROID_UIAUTOMATOR, 
                   f'new UiSelector().text("{text}")')
    
    def by_accessibility_id(self, accessibility_id):
        return (MobileBy.ACCESSIBILITY_ID, accessibility_id)

# Usage in page objects
class ProductPage(BasePage):
    def __init__(self, driver):
        super().__init__(driver)
        self.locators = LocatorFactory(driver.capabilities['platformName'])
    
    def select_product(self, product_name):
        locator = self.locators.by_text(product_name)
        self.tap(locator)
\`\`\`

## Handling Mobile-Specific Gestures

\`\`\`python
# utils/gestures.py
class Gestures:
    def __init__(self, driver):
        self.driver = driver
    
    def scroll_to_element(self, locator, max_swipes=5):
        """Scroll until element is visible"""
        for _ in range(max_swipes):
            try:
                element = self.driver.find_element(*locator)
                if element.is_displayed():
                    return element
            except:
                pass
            self.swipe_up()
        raise Exception(f"Element {locator} not found after {max_swipes} swipes")
    
    def swipe_left_on_element(self, element):
        """Swipe left on specific element (e.g., to delete)"""
        location = element.location
        size = element.size
        
        start_x = location['x'] + int(size['width'] * 0.9)
        start_y = location['y'] + size['height'] // 2
        end_x = location['x'] + int(size['width'] * 0.1)
        
        self.driver.swipe(start_x, start_y, end_x, start_y, 500)
    
    def long_press(self, locator, duration=1000):
        """Long press on element"""
        element = self.driver.find_element(*locator)
        from appium.webdriver.common.touch_action import TouchAction
        
        action = TouchAction(self.driver)
        action.long_press(element, duration=duration).release().perform()
\`\`\`

## Real Device vs Emulator Strategy

My testing pyramid:

1. **Emulators (80% of tests):** Fast, cheap, good for regression
2. **Real Devices (20% of tests):** Critical flows, device-specific features

\`\`\`python
# conftest.py
@pytest.fixture(scope="session")
def test_environment(request):
    env = request.config.getoption("--environment")
    
    if env == "local":
        # Use local emulator
        return {
            "appium_url": "http://localhost:4723/wd/hub",
            "device_type": "emulator"
        }
    elif env == "browserstack":
        # Use BrowserStack real devices
        return {
            "appium_url": f"https://{BS_USER}:{BS_KEY}@hub-cloud.browserstack.com/wd/hub",
            "device_type": "real",
            "browserstack.debug": True
        }
\`\`\`

## Cloud Device Testing with BrowserStack

For real device testing, I used BrowserStack:

\`\`\`python
# config/browserstack.py
BS_CAPABILITIES = {
    "build": "Mobile Automation v1.0",
    "project": "E-Commerce App",
    "browserstack.debug": True,
    "browserstack.networkLogs": True,
    "browserstack.appiumLogs": True
}

def get_browserstack_device_cap(device_name):
    devices = {
        "iPhone 14": {
            "device": "iPhone 14",
            "osVersion": "16",
            "platformName": "iOS"
        },
        "Samsung S22": {
            "device": "Samsung Galaxy S22",
            "osVersion": "12.0",
            "platformName": "Android"
        }
    }
    
    caps = {**BS_CAPABILITIES, **devices[device_name]}
    caps["app"] = upload_app_to_browserstack()
    return caps
\`\`\`

## Parallel Execution

Running tests on multiple devices simultaneously:

\`\`\`python
# pytest.ini
[pytest]
addopts = -n 4 --dist loadgroup

# conftest.py
@pytest.fixture(scope="session")
def device_pool():
    return [
        {"platform": "iOS", "device": "iPhone 14"},
        {"platform": "iOS", "device": "iPhone 13"},
        {"platform": "Android", "device": "Samsung S22"},
        {"platform": "Android", "device": "Pixel 7"}
    ]

@pytest.mark.parametrize("device_config", device_pool())
def test_login_flow(device_config):
    driver = get_driver(device_config)
    # Test code here
\`\`\`

## Handling Permissions and Alerts

\`\`\`python
# utils/permissions.py
class PermissionHandler:
    def __init__(self, driver):
        self.driver = driver
        self.platform = driver.capabilities['platformName']
    
    def handle_location_permission(self):
        if self.platform == 'iOS':
            alert = self.driver.switch_to.alert
            alert.accept()
        else:
            # Android auto-grants if autoGrantPermissions is true
            # But can also handle manually
            allow_btn = (MobileBy.ID, "com.android.permissioncontroller:id/permission_allow_button")
            try:
                self.driver.find_element(*allow_btn).click()
            except:
                pass
    
    def handle_notification_permission(self):
        # Similar handling for notification permissions
        pass
\`\`\`

## Real Test Example: E-Commerce Flow

\`\`\`python
# tests/test_checkout_flow.py
def test_complete_purchase_flow(driver):
    # Login
    login_page = LoginPage(driver)
    dashboard = login_page.login("test@example.com", "password")
    assert dashboard.is_loaded()
    
    # Browse products
    products = dashboard.goto_products()
    products.search("laptop")
    
    # Select product
    product_detail = products.select_first_product()
    product_detail.add_to_cart()
    
    # Checkout
    cart = product_detail.goto_cart()
    assert cart.get_item_count() == 1
    
    checkout = cart.proceed_to_checkout()
    checkout.enter_shipping_address({
        "street": "123 Main St",
        "city": "San Francisco",
        "zip": "94102"
    })
    
    checkout.enter_payment_info({
        "card_number": "4111111111111111",
        "expiry": "12/25",
        "cvv": "123"
    })
    
    # Confirm
    confirmation = checkout.place_order()
    assert confirmation.get_order_number() is not None
\`\`\`

## Results

After implementing this framework:

- ✅ **Regression time: 2 days → 2 hours** (93% faster)
- ✅ **Coverage: 15+ device/OS combinations**
- ✅ **150+ automated test cases**
- ✅ **Found 23 device-specific bugs** before release
- ✅ **CI integration** - Tests run on every PR

## Key Takeaways

1. **Page Object Model** works great for mobile
2. **Locator strategy** - Account for iOS vs Android differences
3. **Emulators for speed**, real devices for accuracy
4. **Cloud device farms** - Don't maintain physical devices
5. **Parallel execution** - Test multiple devices simultaneously

Mobile automation is challenging but absolutely necessary. The investment pays off immediately in release confidence and bug detection.

---

**Check out my Mobile-Testing-Framework on GitHub** for the complete implementation!
`,
    category: "Mobile Testing",
    tags: ["Appium", "Python", "iOS", "Android", "Mobile Automation"],
    date: "2023-12-20",
    readTime: "16 min read",
    coverImage: "/images/blog/blog-5-cover.png",
  },
  {
    id: 6,
    title: "Building a Fintech Platform Solo: 185 Tables, 69 APIs, 7 Systems",
    excerpt: "The full story of architecting and building the Nexural ecosystem from scratch — database design, API architecture, Stripe integration, and lessons from being the sole engineer on a production fintech platform.",
    content: "How I built a complete fintech platform as a solo engineer...",
    fullContent: `
# Building a Fintech Platform Solo: 185 Tables, 69 APIs, 7 Systems

Most engineers work on one service at a time. I built an entire ecosystem.

The Nexural platform started as a simple idea: a dashboard for my trading community. It became a full fintech platform with 185 database tables, 69 API endpoints, Stripe billing, an AI-powered Discord bot, a research engine, a newsletter studio, and a real-time alert system.

I designed and built all of it. Here's what I learned.

## The Scope

Seven interconnected systems:
1. **Trading Dashboard** — real-time market data, charts, portfolio tracking
2. **Discord AI Engine** — 30+ commands, GPT-4o integration, auto-moderation
3. **Research Engine** — 71+ metrics, strategy analysis, CSV import
4. **Alert System** — NinjaTrader 8 integration, .NET backend, real-time notifications
5. **Newsletter Studio** — automated content generation and distribution
6. **Strategy Tracker** — performance monitoring across trading systems
7. **Automation Suite** — 61 test suites, CI/CD, quality gates

## Database Design at Scale

185 tables sounds intimidating. The key was phased design:

- **Phase 1 (Core):** Users, auth, subscriptions — 20 tables
- **Phase 2 (Trading):** Instruments, positions, signals — 35 tables
- **Phase 3 (Community):** Discord integration, moderation logs — 25 tables
- **Phase 4 (Analytics):** Metrics, reports, telemetry — 30 tables
- **Phase 5-7:** Research, alerts, newsletter — 75 tables

Each phase had its own migration, its own test suite, and its own rollback plan. I never modified more than one domain at a time.

### Schema Decisions That Mattered

**Normalized where it counts:** User → Subscription → Plan is fully normalized. No denormalization shortcuts that would create billing bugs.

**Denormalized where speed matters:** Trading dashboards query denormalized views. A trader doesn't care about 3NF — they care about sub-50ms load times.

**Row-level security everywhere:** Supabase RLS policies on every table. A user can never see another user's data, even if the API has a bug.

## API Architecture

69 endpoints following consistent patterns:

\`\`\`
GET    /api/v1/instruments          — list with pagination
GET    /api/v1/instruments/:id      — detail
POST   /api/v1/instruments          — create (admin)
PATCH  /api/v1/instruments/:id      — update (admin)
DELETE /api/v1/instruments/:id      — soft delete (admin)
\`\`\`

Every endpoint has:
- Zod schema validation on input
- Rate limiting (per-user, per-endpoint)
- Structured error responses
- Full test coverage

## Stripe Integration

Billing is where fintech gets real. I implemented:
- Subscription lifecycle (create, upgrade, downgrade, cancel)
- Webhook handling for payment events
- Dunning for failed payments
- Prorated billing on plan changes
- Invoice generation

The Stripe webhook handler alone is 400 lines of carefully tested code. Payment bugs are the kind that lose customers permanently.

## What I'd Do Differently

1. **Start with a monorepo.** I split services too early. A monorepo with shared types would have saved weeks of type synchronization.
2. **API versioning from day one.** I added /v1/ after breaking two integrations. Should have been there from the start.
3. **Less custom, more conventions.** I built custom auth middleware when NextAuth would have been fine for v1.

## The Real Lesson

Building a platform solo teaches you something that team environments don't: every decision compounds. Good architecture decisions save you hundreds of hours later. Bad ones haunt you at 2am.

The Nexural ecosystem works because I spent more time designing than coding. The schema document was 40 pages before I wrote the first migration.

If you're building something ambitious alone, invest in architecture first. The code is the easy part.
`,
    category: "Architecture",
    tags: ["Next.js", "Supabase", "Stripe", "Architecture", "Database Design", "FinTech"],
    date: "2026-04-20",
    readTime: "14 min read",
  },
  {
    id: 7,
    title: "Building an AI Discord Bot for a Trading Community",
    excerpt: "How I built the Nexural Discord AI Engine — 30+ commands, GPT-4o integration, auto-moderation, and market intelligence. Lessons on AI safety in financial contexts.",
    content: "Building an AI-powered Discord bot for traders...",
    fullContent: `
# Building an AI Discord Bot for a Trading Community

Trading communities have unique needs that generic bots can't handle. Traders need market data, not memes. They need AI that understands financial context, not generic chatbots. They need moderation that catches pump-and-dump schemes, not just spam.

I built the Nexural Discord AI Engine to solve these problems. Here's what went into it.

## The Architecture

The bot runs as a Node.js service with:
- **Discord.js** for the bot framework
- **GPT-4o** for natural language interactions
- **Supabase** for persistent storage (user data, conversation history, moderation logs)
- **Alpaca API** for real-time market data
- **Custom middleware** for rate limiting, permission checks, and audit logging

## 30+ Commands, 12 Phases

I built this iteratively across 12 development phases:

- **Phase 0-2:** Core commands, welcome system, basic moderation
- **Phase 3-5:** Market data integration, AI chat, portfolio tracking
- **Phase 6-8:** Auto-moderation, community management, role management
- **Phase 9-12:** Analytics, alerting, performance optimization

Each phase had its own test suite and rollback plan. I never deployed more than one phase at a time.

## AI Safety in Financial Contexts

This is where it gets serious. An AI bot in a trading community can't:
- Give financial advice (legal liability)
- Generate trading signals (regulatory issues)
- Confirm or deny specific trade ideas (responsibility)

My approach:

**Strict system prompts:** GPT-4o receives a 2,000-word system prompt that explicitly defines what it can and cannot discuss. Every response is framed as educational, never advisory.

**Response validation:** Before any AI response is sent to Discord, it passes through a filter that checks for:
- Price predictions ("will go up/down")
- Specific trade recommendations ("buy/sell X")
- Guarantees or promises of returns
- Inappropriate content

**Disclaimers:** Every AI response includes a footer: "This is educational content, not financial advice."

**Audit logging:** Every AI interaction is logged to Supabase with the prompt, response, and whether any filters triggered.

## Market Data Integration

The Alpaca API provides real-time market data:

\`\`\`javascript
// Simplified market data command
async function getQuote(symbol) {
  const snapshot = await alpaca.getSnapshot(symbol);
  return {
    price: snapshot.latestTrade.p,
    change: snapshot.dailyBar.c - snapshot.dailyBar.o,
    volume: snapshot.dailyBar.v,
    timestamp: snapshot.latestTrade.t
  };
}
\`\`\`

Users can query any stock or crypto with \`/quote AAPL\` and get real-time data formatted in a Discord embed.

## Auto-Moderation

Beyond standard spam detection, the bot watches for:
- **Pump-and-dump language** — "guaranteed returns", "moon", "100x"
- **Unverified claims** — "I made $X today" without proof
- **Scam patterns** — DM solicitation, fake giveaways
- **Off-topic flooding** — keeping channels focused

Each moderation action is logged, reviewable by admins, and appealable by users.

## Lessons Learned

1. **AI in financial contexts requires 10x more guardrails** than general-purpose bots. One bad response can have legal consequences.
2. **Rate limiting is critical.** GPT-4o costs money. Without per-user rate limits, one person can rack up $50 in API calls in an hour.
3. **Conversation context matters.** Stateless AI responses feel robotic. Storing conversation history in Supabase makes the bot feel intelligent.
4. **Test your moderation rules on real data.** My initial filters had a 30% false positive rate. After tuning on actual community messages, it dropped to under 5%.

The bot is now live and actively used by the Nexural trading community. It handles 200+ interactions per day with zero moderation incidents.
`,
    category: "AI",
    tags: ["Discord.js", "GPT-4o", "Node.js", "Supabase", "AI Safety", "Trading"],
    date: "2026-04-15",
    readTime: "12 min read",
  },
  {
    id: 8,
    title: "Why I Treat My Portfolio Like a Production System",
    excerpt: "SLOs, incident drills, WAF rate limiting, and OIDC federation — why I operate my portfolio site with the same rigor as enterprise infrastructure, and what it signals to hiring managers.",
    content: "Operating a portfolio like production infrastructure...",
    fullContent: `
# Why I Treat My Portfolio Like a Production System

Most developer portfolios are static sites. Mine has SLOs.

This isn't about over-engineering. It's about demonstrating a specific skill that's hard to show in interviews: **operational maturity**.

## What "Production-Grade Portfolio" Means

My portfolio site (sageideas.dev) has:

- **SLO targets:** 99.9% dashboard availability, <24h telemetry freshness, <500ms P95 response time
- **Incident drills:** 4 failure scenarios tested with documented responses
- **WAF rate limiting:** CloudFront Web ACL with attack simulation evidence
- **OIDC federation:** GitHub Actions → AWS without static credentials
- **Quality telemetry:** Live dashboard pulling CI artifacts in real-time
- **Security receipts:** IAM policies, threat models, and evidence for every claim

## Why Bother?

Because the gap between "I can build things" and "I can run things" is where senior roles live.

Junior engineers build features. Mid-level engineers build systems. Senior engineers **operate** systems — they think about failure modes, blast radius, cost, compliance, and what happens at 3am.

By treating my portfolio like production, I'm showing:

1. **I think about failure before it happens** — every external dependency has a fallback
2. **I measure what matters** — SLOs, not vanity metrics
3. **I document for the next person** — runbooks, playbooks, architecture docs
4. **I don't cut corners on security** — even for a portfolio site

## The Incident Drill Pattern

Every quarter, I run through 4 scenarios:

| Scenario | Response | Status |
|---|---|---|
| GitHub API rate limits | Fall back to snapshot mode | Tested |
| Missing CI artifact | Scan recent runs, degrade gracefully | Tested |
| AWS proxy token mismatch | CloudWatch alarm, auto-degrade | Tested |
| S3 object missing | Fail closed, no secrets leak | Tested |

Each drill follows: **detect → triage → mitigate → verify → document**

The drill report is publicly available in my artifacts library.

## What Hiring Managers Notice

When I interview for senior/staff roles, I don't talk about my portfolio's design. I talk about its operations:

- "Here's my SLO dashboard. We're at 99.94% this month."
- "Here's a WAF rate limiting test I ran last week. 429s trigger at 100 req/5min."
- "Here's the IAM policy. The Lambda has exactly one permission: s3:GetObject on one key."

This changes the conversation from "can you code?" to "can you run systems?" — which is what $200K+ roles actually require.

## How to Do This Yourself

You don't need AWS. Start small:

1. **Define one SLO** — "My site will have 99% uptime this month." Monitor it.
2. **Add one quality gate** — Lighthouse CI in your deploy pipeline. Fail the build if performance drops.
3. **Document one failure mode** — "If my API key expires, what happens?" Write the answer down.
4. **Run one incident drill** — Actually break something intentionally and practice the response.

The goal isn't perfection. It's demonstrating that you think about production, not just development.
`,
    category: "Cloud Automation",
    tags: ["SLOs", "Operations", "Security", "AWS", "Production", "Career"],
    date: "2026-04-10",
    readTime: "10 min read",
  },
  {
    id: 9,
    title: "The Recruiter Pack: Why I Give Away My QA Playbooks",
    excerpt: "I created a downloadable ZIP with my resume, test strategies, architecture samples, and operational evidence. Here's why giving away your best work for free is the best career move you can make.",
    content: "Why downloadable artifacts beat traditional portfolios...",
    fullContent: `
# The Recruiter Pack: Why I Give Away My QA Playbooks

My portfolio site has a download button. Click it, and you get a ZIP file containing:

- My resume (PDF)
- A test strategy template (filled, not blank)
- An architecture sample (the Nexural platform blueprint)
- Security evidence (WAF rate limiting proof)
- An incident drill report (postmortem format)
- A quality dashboard walkthrough script

Why would I give away my best work for free?

## The Hiring Funnel Problem

Here's how most hiring works:

1. Recruiter sees your resume (30 seconds)
2. If interested, they forward to hiring manager
3. Hiring manager checks your portfolio (60 seconds)
4. If interesting, they schedule a call

The problem is step 2-3. The recruiter isn't technical. They can't evaluate your GitHub repos. They need something they can forward with confidence — something that makes the hiring manager say "bring this person in."

## What the Recruiter Pack Solves

A ZIP file with your best artifacts does three things:

**1. It's forwardable.** A recruiter can attach it to an internal email: "Check out this candidate's materials." They can't do that with a GitHub link.

**2. It's evaluable by non-technical people.** A filled test strategy template shows process. An incident drill report shows maturity. These are readable by anyone.

**3. It shows generosity and confidence.** Most candidates hoard their work. Giving it away signals that you have more where that came from.

## What's In My Pack

### Test Strategy (Filled)
Not a blank template — a completed test strategy for a real project. It shows:
- How I scope testing
- How I prioritize (risk-based, not checkbox-based)
- How I communicate test plans to non-technical stakeholders

### Architecture Sample
A blueprint showing database design, API structure, and system interconnections. Demonstrates that I think architecturally, not just in functions and classes.

### Security Evidence
A WAF rate limiting test with actual HTTP responses. Shows that I don't just claim security — I prove it with evidence.

### Incident Drill Report
A postmortem-format report for a simulated incident. Demonstrates operational thinking: timeline, root cause, mitigation, follow-ups.

### Dashboard Walkthrough
A script for demoing my quality telemetry dashboard in an interview. Shows preparation and presentation skills.

## The Results

Since adding the recruiter pack:
- Recruiter response rate increased (they have something tangible to share)
- Interview conversations start deeper (they've already seen my work)
- I spend less time in "tell me about yourself" and more time in technical discussion

## Build Your Own

1. Pick your 3-5 best artifacts (not code — documents, reports, evidence)
2. Make sure each one is self-explanatory (no context needed)
3. Put them in a ZIP with a one-page index
4. Add a prominent download button to your portfolio

The best portfolio isn't a wall of project cards. It's a package that makes someone say "I need to talk to this person."

You can download my recruiter pack at [sageideas.dev/artifacts](/artifacts).
`,
    category: "Career",
    tags: ["Career", "Recruiting", "QA", "Portfolio", "Job Search"],
    date: "2026-04-05",
    readTime: "8 min read",
  }
];
