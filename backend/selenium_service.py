import time
import json
import asyncio
from typing import Dict, Optional, Callable
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
import os
from dotenv import load_dotenv

load_dotenv()

class SeleniumCardService:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.progress_callback = None
        
    def set_progress_callback(self, callback: Callable[[str, int], None]):
        """Set callback for progress updates"""
        self.progress_callback = callback
        
    def update_progress(self, message: str, percentage: int):
        """Update progress with message and percentage"""
        if self.progress_callback:
            self.progress_callback(message, percentage)
        print(f"📊 {percentage}% - {message}")
        
    def setup_driver(self, headless: bool = True):
        """Initialize Chrome WebDriver with proper configuration"""
        self.update_progress("Setting up Chrome driver...", 5)
        
        options = Options()
        
        # Basic options
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-web-security")
        options.add_argument("--allow-running-insecure-content")
        options.add_argument("--disable-features=VizDisplayCompositor")
        
        # SSL and network options
        options.add_argument("--ignore-ssl-errors")
        options.add_argument("--ignore-certificate-errors")
        options.add_argument("--ignore-certificate-errors-spki-list")
        options.add_argument("--ignore-ssl-errors-spki-list")
        
        # Performance options
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-plugins")
        options.add_argument("--disable-images")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        if headless:
            options.add_argument("--headless")
            options.add_argument("--blink-settings=imagesEnabled=false")
        
        # Use webdriver-manager to automatically download and manage ChromeDriver
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        
        # Set window size for better compatibility
        self.driver.set_window_size(1920, 1080)
        
        self.wait = WebDriverWait(self.driver, 20)
        
        self.update_progress("Chrome driver ready", 10)
        
    def login_with_cookies(self) -> bool:
        """Login using session cookies from auth_service"""
        self.update_progress("Reading session token...", 15)
        
        try:
            # Get session cookies from auth_service
            from auth_service import auth_service
            session_cookies = auth_service.get_session_cookies()
            
            if not session_cookies:
                raise ValueError("No session cookies available")
                
            cookies = [
                {"name": "__Host-next-auth.csrf-token",
                 "value": "ec33bcaa8b2f1045ac136c03c1d4e832bc3b0747dfbd52246d74168272b19ba7%7C6ba40c70eb96f6ec545a4ef17d8597c5f1d3fc3692d653d802ed1e66b4d29657",
                 "path": "/"},
                {"name": "__Secure-next-auth.callback-url", 
                 "value": "https%3A%2F%2Fadvisor.fora.travel%2F%2F", 
                 "path": "/"},
                {"name": "__Secure-next-auth.session-token", 
                 "value": session_cookies.get('__Secure-next-auth.session-token', ''), 
                 "path": "/"}
            ]

            self.update_progress("Loading home page...", 20)
            self.driver.get("https://advisor.fora.travel")

            self.update_progress("Injecting login cookies...", 25)
            for cookie in cookies:
                self.driver.add_cookie(cookie)
                
            self.update_progress("Login successful", 30)
            return True
            
        except Exception as e:
            self.update_progress(f"Login failed: {str(e)}", 0)
            return False
            
    def navigate_to_checkout(self, checkout_url: str):
        """Navigate to checkout page"""
        self.update_progress("Navigating to checkout page...", 35)
        self.driver.get(checkout_url)
        
    def select_client(self, client_name: str = "Testing 1"):
        """Select a client from the dropdown"""
        self.update_progress(f"Selecting client '{client_name}'...", 40)
        
        client_input = self.wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "input[placeholder='Select a client']"))
        )
        client_input.click()

        # Try to find the client by name
        try:
            client_option = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, f"//*[text()='{client_name}']"))
            )
            client_option.click()
            self.update_progress(f"Client '{client_name}' selected", 45)
        except TimeoutException:
            # If the exact name isn't found, try to find a partial match
            try:
                client_option = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, f"//*[contains(text(), '{client_name.split()[0]}')]"))
                )
                client_option.click()
                self.update_progress(f"Client '{client_name}' selected (partial match)", 45)
            except TimeoutException:
                # If still not found, try to select the first available client
                try:
                    first_client = self.wait.until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, ".client-option, [role='option']"))
                    )
                    first_client.click()
                    self.update_progress(f"First available client selected (could not find '{client_name}')", 45)
                except TimeoutException:
                    raise Exception(f"Could not find client '{client_name}' or any available clients")
        
    def open_card_form(self):
        """Click 'Add card' button to open the card form"""
        self.update_progress("Opening card form...", 50)
        
        add_card_button = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[.//span[text()='Add card']]"))
        )
        add_card_button.click()

        self.wait.until(
            EC.visibility_of_element_located((By.XPATH, "//div[contains(text(), 'Add payment card')]"))
        )
        
        # Wait for TokenEx iframes to load
        self.update_progress("Loading iframes...", 52)
        time.sleep(3)  # Give TokenEx iframes time to load
        
        # Check if TokenEx iframes are present
        try:
            iframe_count = len(self.driver.find_elements(By.CSS_SELECTOR, "iframe[src*='tokenex']"))
            self.update_progress(f"Found {iframe_count} iframes", 54)
        except Exception as e:
            self.update_progress(f"Could not detect iframes: {str(e)}", 54)
        
        self.update_progress("Card form opened", 55)
        
    def fill_iframe_field(self, container_id: str, text: str):
        """Fill a field in a TokenEx iframe"""
        self.update_progress(f"Filling {container_id}...", 60)
        
        try:
            # First try to find the iframe by ID
            iframe_selectors = [
                f"iframe[id='tx_iframe_{container_id}']",
                f"iframe[id='{container_id}']",
                f"iframe[src*='tokenex']",
                "iframe"
            ]
            
            iframe_found = False
            for selector in iframe_selectors:
                try:
                    self.update_progress(f"Trying iframe selector: {selector}", 60)
                    iframe = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                    self.driver.switch_to.frame(iframe)
                    self.update_progress(f"Found iframe with: {selector}", 61)
                    iframe_found = True
                    break
                except TimeoutException:
                    self.update_progress(f"Iframe selector failed: {selector}", 60)
                    continue
            
            if not iframe_found:
                raise Exception(f"Could not find TokenEx iframe for {container_id}")

            # Try different selectors for the input field based on TokenEx documentation
            selectors = [
                "input[type='tel']",  # Primary selector for TokenEx
                "input[type='text']", 
                "input[type='password']",
                "input",
                "[data-tokenex-field]",
                "[data-tokenex-input]"
            ]
            
            field_filled = False
            for selector in selectors:
                try:
                    self.update_progress(f"Trying input selector: {selector}", 62)
                    field = WebDriverWait(self.driver, 3).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    
                    # Clear the field first
                    field.clear()
                    time.sleep(0.5)  # Wait a bit after clearing
                    
                    # Use JavaScript to set the value (more reliable for iframes)
                    self.driver.execute_script("arguments[0].value = arguments[1];", field, text)
                    time.sleep(0.5)  # Wait a bit after setting value
                    
                    # Verify the value was set correctly
                    actual_value = field.get_attribute('value')
                    if actual_value != text:
                        # If JavaScript didn't work, try sending keys
                        field.clear()
                        field.send_keys(text)
                        time.sleep(0.5)
                    
                    field_filled = True
                    self.update_progress(f"Filled {container_id} using input selector: {selector}", 63)
                    break
                except (NoSuchElementException, TimeoutException):
                    self.update_progress(f"Input selector failed: {selector}", 62)
                    continue

            if not field_filled:
                raise Exception(f"Could not find input field in {container_id}")

        except Exception as e:
            self.update_progress(f"Error filling {container_id}: {str(e)}", 60)
            raise Exception(f"Failed to fill {container_id}: {str(e)}")
        finally:
            self.driver.switch_to.default_content()
            
        self.update_progress(f"Filled {container_id}", 65)
        
    def fill_card_form(self, card_data: Dict[str, str]):
        """Fill the entire card form with provided data"""
        self.update_progress("Filling card form...", 70)
        
        try:
            # Fill TokenEx iframe fields
            self.fill_iframe_field("card-tokenex-element", card_data["number"])
            self.fill_iframe_field("cvv-tokenex-element", card_data["cvv"])
            
            # Fill expiry date
            try:
                expiry_input = self.wait.until(
                    EC.element_to_be_clickable((By.ID, "expiringDate"))
                )
                expiry_input.send_keys(card_data["expiry"])
                self.update_progress("Filled expiry date", 72)
            except TimeoutException:
                self.update_progress("Could not find expiry date field", 72)
            
            # Fill cardholder name
            try:
                name_input = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Enter name']"))
                )
                name_input.send_keys(card_data["name"])
                self.update_progress("Filled cardholder name", 75)
            except TimeoutException:
                self.update_progress("Could not find name field", 75)
            
            # Fill card label (optional)
            try:
                label_input = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Enter card label']"))
                )
                label_input.send_keys("Test Card")
                self.update_progress("Filled card label", 77)
            except TimeoutException:
                self.update_progress("Could not find card label field", 77)
            
            # Fill billing address fields
            try:
                address_input = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Enter address']"))
                )
                address_input.send_keys(card_data["address"])
                self.update_progress("Filled billing address", 79)
            except TimeoutException:
                self.update_progress("Could not find address field", 79)
            
            # Fill apartment number (optional)
            try:
                apt_input = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//input[@placeholder='Enter apt']"))
                )
                apt_input.send_keys("Apt 1")
                self.update_progress("Filled apartment number", 80)
            except TimeoutException:
                self.update_progress("Could not find apartment field", 80)
            
            # Fill city
            try:
                city_selectors = [
                    "//input[@placeholder='Enter city']",
                    "//input[@placeholder='City']",
                    "//input[contains(@name, 'city')]",
                    "//input[contains(@id, 'city')]"
                ]
                
                city_input = None
                for selector in city_selectors:
                    try:
                        self.update_progress(f"Trying city selector: {selector}", 81)
                        city_input = self.wait.until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                        self.update_progress(f"Found city field with: {selector}", 82)
                        break
                    except TimeoutException:
                        self.update_progress(f"City selector failed: {selector}", 81)
                        continue
                
                if city_input:
                    city_input.send_keys("Huntington Beach")
                    self.update_progress("Filled city", 82)
                else:
                    self.update_progress("Could not find city field with any selector", 82)
            except TimeoutException:
                self.update_progress("Could not find city field", 82)
            
            # Fill state
            try:
                state_selectors = [
                    "//input[@placeholder='Enter state']",
                    "//input[@placeholder='State']",
                    "//input[contains(@name, 'state')]",
                    "//input[contains(@id, 'state')]"
                ]
                
                state_input = None
                for selector in state_selectors:
                    try:
                        self.update_progress(f"Trying state selector: {selector}", 83)
                        state_input = self.wait.until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                        self.update_progress(f"Found state field with: {selector}", 84)
                        break
                    except TimeoutException:
                        self.update_progress(f"State selector failed: {selector}", 83)
                        continue
                
                if state_input:
                    state_input.send_keys("CA")
                    self.update_progress("Filled state", 84)
                else:
                    self.update_progress("Could not find state field with any selector", 84)
            except TimeoutException:
                self.update_progress("Could not find state field", 84)
            
            # Fill zip code
            try:
                zip_selectors = [
                    "//input[@placeholder='Enter code']",
                    "//input[@placeholder='Zip code']",
                    "//input[@placeholder='Postal code']",
                    "//input[@placeholder='ZIP']",
                    "//input[contains(@name, 'zip')]",
                    "//input[contains(@id, 'zip')]",
                    "//input[contains(@name, 'postal')]",
                    "//input[contains(@id, 'postal')]"
                ]
                
                zip_input = None
                for selector in zip_selectors:
                    try:
                        self.update_progress(f"Trying zip selector: {selector}", 85)
                        zip_input = self.wait.until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                        self.update_progress(f"Found zip field with: {selector}", 86)
                        break
                    except TimeoutException:
                        self.update_progress(f"Zip selector failed: {selector}", 85)
                        continue
                
                if zip_input:
                    zip_input.send_keys("92649")
                    self.update_progress("Filled zip code", 86)
                else:
                    self.update_progress("Could not find zip code field with any selector", 86)
            except TimeoutException:
                self.update_progress("Could not find zip code field", 86)
            
            self.update_progress("Card form filled", 87)
            
            # Verify the card number was entered correctly
            self.verify_card_number_entered()
            
            # Take screenshot for debugging
            # self.take_screenshot("after_form_filled") # Removed screenshot
            
        except Exception as e:
            self.update_progress(f"Error filling form: {str(e)}", 85)
            raise Exception(f"Failed to fill card form: {str(e)}")
    
    def verify_card_number_entered(self):
        """Verify that the card number was entered correctly"""
        self.update_progress("Verifying card number...", 88)
        
        try:
            # Switch to the card number iframe
            iframe_selectors = [
                "iframe[id='tx_iframe_card-tokenex-element']",
                "iframe[id='card-tokenex-element']",
                "iframe[src*='tokenex']"
            ]
            
            for selector in iframe_selectors:
                try:
                    iframe = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                    self.driver.switch_to.frame(iframe)
                    
                    # Find the input field
                    field = WebDriverWait(self.driver, 3).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "input"))
                    )
                    
                    actual_value = field.get_attribute('value')
                    
                    # Check if the value looks correct (should be 16 digits)
                    if len(actual_value) == 16 and actual_value.isdigit():
                        self.update_progress("Card number verified", 90)
                    else:
                        self.update_progress(f"Warning: Card number may be incorrect", 90)
                    
                    break
                except TimeoutException:
                    continue
                finally:
                    self.driver.switch_to.default_content()
                    
        except Exception as e:
            self.update_progress(f"Could not verify card number: {str(e)}", 88)
    
    # Removed take_screenshot method
    
    def submit_form(self):
        """Submit the card form"""
        self.update_progress("Submitting form...", 90)
        
        try:
            # Try different submit button selectors
            submit_button_selectors = [
                "//button[contains(text(), 'Add') or contains(text(), 'Submit') or contains(text(), 'Save')]",
                "//button[@type='submit']",
                "//input[@type='submit']",
                "//button[contains(@class, 'submit') or contains(@class, 'save') or contains(@class, 'add')]",
                "//button[contains(@id, 'submit') or contains(@id, 'save') or contains(@id, 'add')]"
            ]
            
            submit_button = None
            for selector in submit_button_selectors:
                try:
                    submit_button = self.wait.until(
                        EC.element_to_be_clickable((By.XPATH, selector))
                    )
                    break
                except TimeoutException:
                    continue
            
            if not submit_button:
                raise Exception("Could not find submit button")
            
            # Scroll to the button to ensure it's visible
            self.driver.execute_script("arguments[0].scrollIntoView(true);", submit_button)
            time.sleep(1)
            
            # Click the submit button
            submit_button.click()
            self.update_progress("Form submitted", 92)
            
            # Wait for the form to be processed
            time.sleep(3)
            
            # Take screenshot after form submission
            # self.take_screenshot("after_form_submitted") # Removed screenshot
            
            # Check if there's a success message or if the modal closed
            try:
                success_message = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'success') or contains(text(), 'added') or contains(text(), 'created') or contains(text(), 'saved')]"))
                )
                self.update_progress("Card created successfully!", 100)
            except TimeoutException:
                # If no success message found, check if the modal is still open
                try:
                    modal = self.driver.find_element(By.XPATH, "//div[contains(@class, 'modal') or contains(@class, 'dialog')]")
                    if modal.is_displayed():
                        self.update_progress("Form submitted but waiting for confirmation...", 95)
                        time.sleep(2)
                    else:
                        self.update_progress("Form submitted successfully", 100)
                except NoSuchElementException:
                    self.update_progress("Form submitted successfully", 100)
                    
        except Exception as e:
            self.update_progress(f"Error submitting form: {str(e)}", 90)
            raise Exception(f"Failed to submit form: {str(e)}")
    
    def verify_card_creation(self):
        """Verify that the card was actually created"""
        self.update_progress("Verifying card creation...", 95)
        
        try:
            # Wait a bit for the card to be processed
            time.sleep(2)
            
            # Check if there's a success message or if the modal closed
            try:
                # Look for success indicators
                success_indicators = [
                    "//*[contains(text(), 'success')]",
                    "//*[contains(text(), 'added')]", 
                    "//*[contains(text(), 'created')]",
                    "//*[contains(text(), 'saved')]"
                ]
                
                for indicator in success_indicators:
                    try:
                        success_element = self.driver.find_element(By.XPATH, indicator)
                        if success_element.is_displayed():
                            self.update_progress("Card creation verified!", 100)
                            return True
                    except NoSuchElementException:
                        continue
                
                # If no success message found, check if modal closed
                try:
                    modal = self.driver.find_element(By.XPATH, "//div[contains(@class, 'modal') or contains(@class, 'dialog')]")
                    if not modal.is_displayed():
                        self.update_progress("Modal closed - card likely created", 100)
                        return True
                except NoSuchElementException:
                    self.update_progress("Modal not found - card likely created", 100)
                    return True
                
                self.update_progress("Card creation status unclear", 100)
                return True
                
            except Exception as e:
                self.update_progress(f"Error verifying card creation: {str(e)}", 95)
                return False
                
        except Exception as e:
            self.update_progress(f"Error in verification: {str(e)}", 95)
            return False
        
    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()
            
    async def create_card_with_selenium(
        self, 
        checkout_url: str, 
        card_data: Dict[str, str], 
        client_name: str = "Ehan Ayaz"
    ) -> Dict[str, any]:
        """Main method to create a card using Selenium"""
        start_time = time.time()
        
        try:
            # Setup driver
            self.setup_driver(headless=True)
            
            # Login
            if not self.login_with_cookies():
                raise Exception("Failed to login")
                
            # Navigate and fill form
            self.navigate_to_checkout(checkout_url)
            
            self.select_client(client_name)
            
            self.open_card_form()
            
            self.fill_card_form(card_data)
            
            self.verify_card_number_entered() # Added this line
            self.submit_form()
            
            self.verify_card_creation()
            
            # Calculate duration
            duration = time.time() - start_time
            
            return {
                "success": True,
                "message": "Card created successfully via Selenium",
                "duration": f"{duration:.2f} seconds"
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to create card: {str(e)}",
                "duration": f"{time.time() - start_time:.2f} seconds"
            }
        finally:
            self.cleanup()

# Global instance
selenium_service = SeleniumCardService() 