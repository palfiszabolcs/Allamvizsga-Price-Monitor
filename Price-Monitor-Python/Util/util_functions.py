import time
import re
from logging.config import fileConfig
from dacite import from_dict
import json
import logging
from Classes import class_NewData, class_Product, class_ProductData, class_UtilNewData, class_UtilProduct
from Util import currency
from Util import constants
import requests

fileConfig('logging_config.ini')
logger = logging.getLogger()


def find_price(soup, tag, class_name):
    try:
        price = soup.find(tag, attrs={"class": class_name}).text.strip()
    except AttributeError:
        return constants.error
        # raise Exception("object has no attribute: text (title tag changed / url may not exist)")
    return price


def find_title(soup, tag, class_name):
    try:
        title = soup.find(tag, attrs={"class": class_name}).text.strip()
    except AttributeError:
        return constants.error
        # raise Exception("object has no attribute: text (title tag changed / url may not exist)")
    return title


def get_site_address(url):
    pattern = r'[a-zA-z]+\.ro+|[a-zA-z]+\.com+|[a-zA-z]+\.eu+'
    address = re.findall(pattern, url)
    address = address[0]
    return address


def print_product_info(title, price, prod_currency, image):
    print("Product: " + title + "\nPrice(" + prod_currency + "):", price, "\nImageURL: " + image)


# returns a the data of a product(id)
def get_product_data(user, product):
    from firebase import firebase
    firebase = firebase.FirebaseApplication(constants.database, None)
    try:
        dict_data = firebase.get(constants.USERS + user + "/" + product, None)
        return dict_data
    except requests.exceptions.ConnectionError as error:
        logger.critical("get_product_data - " + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return get_product_data(user, product)


# returns a the data of a product from the NEW folder
def get_new_product_data(user, product):
    from firebase import firebase
    firebase = firebase.FirebaseApplication(constants.database, None)
    try:
        dict_data = firebase.get(constants.NEW + user + "/" + product, None)
        return dict_data
    except requests.exceptions.ConnectionError as error:
        logger.critical("get_new_product_data - " + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return get_new_product_data(user, product)


# returns a list of id-s
def get_user_products(user):
    from firebase import firebase
    firebase = firebase.FirebaseApplication(constants.database, None)
    try:
        dict_data = firebase.get(constants.USERS + user, None)
        return dict_data
    except requests.exceptions.ConnectionError as error:
        logger.critical("get_user_products - " + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return get_user_products(user)


def get_new_user_products(user):
    from firebase import firebase
    firebase = firebase.FirebaseApplication(constants.database, None)
    try:
        dict_data = firebase.get(constants.NEW + user, None)
        return dict_data
    except requests.exceptions.ConnectionError as error:
        logger.critical("get_new_user_products - " + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return get_new_user_products(user)


def get_existing_users():
    from firebase import firebase
    firebase = firebase.FirebaseApplication(constants.database, None)
    try:
        result = firebase.get(constants.USERS, None)
        users_list = []
        for user in result:
            users_list.append(user)
        return users_list
    except requests.exceptions.ConnectionError as error:
        logger.critical("get_existing_users - " + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return get_existing_users()


def get_new_users():
    from firebase import firebase
    firebase = firebase.FirebaseApplication(constants.database, None)

    try:
        result = firebase.get(constants.NEW, None)
        if result is None:
            return "none"
        else:
            users_list = []
            for user in result:
                users_list.append(user)
            return users_list
    except requests.exceptions.ConnectionError as error:
        logger.critical("get_new_users - " + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return get_new_users()


def make_product_list(user):
    dict_data = get_user_products(user)
    users_product_list = []
    for prod in dict_data:
        product_data = get_product_data(user, prod)
        data = from_dict(data_class=class_UtilProduct.UtilProduct, data=product_data)
        final_product = class_Product.Product(prod, data)
        users_product_list.append(final_product)

    return users_product_list


def make_new_product_list(user):
    dict_data = get_new_user_products(user)
    users_product_list = []
    for prod in dict_data:
        product_data = get_new_product_data(user, prod)
        data = from_dict(data_class=class_UtilNewData.UtilNewData, data=product_data)
        final_data = class_NewData.NewData(user, data)
        users_product_list.append(final_data)

    return users_product_list


def pretty_print_dict(data):
    print(json.dumps(data, indent=4, sort_keys=True))


def upload_error(user, product_id, cur_date, url):
    from firebase import firebase

    firebase = firebase.FirebaseApplication(constants.database, None)

    error_data = {
        'prod_id:': product_id,
        'url': url,
        'date': cur_date
    }
    try:
        response = firebase.post(constants.ERROR + user, error_data)
        return response
    except requests.exceptions.ConnectionError as error:
        logger.critical("upload_error - " + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return upload_error(user, product_id, cur_date, url)


def upload_check_data(user, product_id, price, cur_date):
    from firebase import firebase

    firebase = firebase.FirebaseApplication(constants.database, None)

    check_data = {
        'price': price,
        'date': cur_date
    }

    try:
        response = firebase.post(constants.USERS + user + "/" + product_id + constants.CHECK, check_data)
        return response
    except requests.exceptions.ConnectionError as error:
        logger.critical("upload_check_data - " + str(error))
        for i in range(5, 0, -1):
            logger.info("Retrying in... " + str(i) + " seconds")
            time.sleep(1)
        return upload_check_data(user, product_id, price, cur_date)


def get_and_parse_emag(soup):
    title = find_title(soup, "h1", "page-title")
    out_of_stock = soup.find("span", attrs={"class": "label-out_of_stock"})

    if out_of_stock or (title is constants.error):
        price = constants.error
    else:
        try:
            form = soup.find("form", attrs={"class": "main-product-form"})
            price = form.find("p", attrs={"class": "product-new-price"}).text.strip()
            s = list(price)
            s.insert(-6, ",")
            price = "".join(s)
            price = re.sub("Lei", '', price)
            price = re.sub("\.", "", price)
            price = re.sub(",", ".", price)
            try:
                price = float(price.strip())
            except ValueError:
                price = re.sub("de la", "", price)
                try:
                    price = float(price.strip())
                except ValueError:
                    price = constants.error
        except AttributeError:
            price = constants.error
    prod_currency = currency.ron
    try:
        image = soup.find("div", attrs={"id": "product-gallery"}).img["src"]
    except AttributeError:
        image = "error"
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_flanco(soup):
    stockless = soup.find("div", attrs={"class": "stockless"})
    try:
        title = soup.find("h1", attrs={"id": "product-title"}).text.strip()
    except AttributeError:
        title = "error"

    price = find_price(soup, "div", "produs-price")
    if stockless or price is constants.error:
        price = constants.error
    else:
        if price != constants.error:
            price = re.sub("\.", '', price)
            price = re.sub(",", ".", price)
            price = re.sub("lei", '', price)
            try:
                price = float(price)
            except ValueError:
                price = constants.error
    prod_currency = currency.ron
    try:
        image = soup.find("div", attrs={"class": "product_image_zoom_container"}).img["src"]
    except AttributeError:
        image = "error"
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_quickmobile(soup):
    title = find_title(soup, "div", "product-page-title page-product-title-wth")
    price = find_price(soup, "div", "priceFormat total-price price-fav product-page-price")
    image = constants.error
    if title is not constants.error or price is not constants.error:
        price = re.sub("Lei", '', price)
        try:
            price = float(price)
        except ValueError:
            price = constants.error

        try:
            image = soup.find("img", attrs={"class": "img-responsive image-gallery"})['src'].strip()
        except AttributeError:
            image = constants.error

    prod_currency = currency.ron
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_altex(soup):
    title = find_title(soup, "h1", "font-bold leading-none text-black m-0 text-2xl lg:text-3xl")
    price = find_price(soup, "div", "Price-current")
    if (title is None) or (price is None):
        return None
    price = re.sub(".", '', price)
    price = re.sub(",", ".", price)
    price = re.sub("lei", '', price)
    try:
        price = float(price)
    except ValueError:
        return None
    prod_currency = currency.ron
    image = soup.find("div", attrs={"class": "slick-slide slick-active slick-current"}).img['src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


# --------------------------------------------
def get_and_parse_mediagalaxy(soup):
    title = find_title(soup, "h1", "font-bold leading-none text-black m-0"
                                   " text-center text-base lg:text-3xl bg-gray-lighter "
                                   "lg:bg-transparent -mx-15px lg:mx-auto px-3"
                                   " pt-4 pb-3 lg:p-0 border-b lg:border-b-0")
    price = find_price(soup, "div", "Price-current")
    price = re.sub(".", '', price)
    price = re.sub(",", ".", price)
    price = re.sub("lei", '', price)
    price = float(price)
    prod_currency = currency.ron
    image = soup.find("div", attrs={"class": "slick-slide slick-active slick-current"}).img['src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_cel(soup):
    title = find_title(soup, "h1", "productName")
    price = find_price(soup, "span", "productPrice")
    price = float(price)
    prod_currency = currency.ron
    image = soup.find("img", attrs={"id": "main-product-image"})['src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_dedeman(soup):
    title = find_title(soup, "h1", "no-margin-bottom product-title")
    price = soup.find("div", attrs={"class": "product-price large"}).span.text.strip()
    price = float(price)
    prod_currency = currency.ron
    image = soup.find("img", attrs={"class": "slider-product-image img-responsive"})['src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_autovit(soup):
    title = find_title(soup, "span", "offer-title big-text fake-title")
    price = find_price(soup, "span", "offer-price__number")
    price = re.sub("EUR", '', price)
    price = re.sub(" ", '', price)
    price = float(price)
    prod_currency = currency.euro
    image = soup.find("div", attrs={"class": "photo-item"}).img['data-lazy'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_evomag(soup):
    title = find_title(soup, "h1", "product_name")
    price = find_price(soup, "div", "pret_rons")
    price = re.sub(".", '', price)
    price = re.sub(",", ".", price)
    price = re.sub("Lei", '', price)
    price = float(price)
    prod_currency = currency.ron
    image = soup.find("a", attrs={"class": "fancybox fancybox.iframe"}).img['src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_gymbeam(soup):
    title = find_title(soup, "h1", "page-title")
    price = find_price(soup, "span", "price")
    price = re.sub(",", '.', price)
    price = re.sub("Lei", '', price)
    price = float(price)
    prod_currency = currency.ron
    image = soup.find("div", attrs={"class": "product media"}).img['data-src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_megaproteine(soup):
    title = soup.find("h1").text.strip()
    price = find_price(soup, "span", "pret")
    price = re.sub(",", '.', price)
    price = re.sub("lei", '', price)
    price = float(price)
    prod_currency = currency.ron
    image = soup.find("link", attrs={"rel": "image_src"})['href'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_sportisimo(soup):
    title = soup.find("h1").text.strip()
    price = soup.find("p", attrs={"class": "price"}).text.strip()
    price = re.sub("Lei cu TVA", '', price)
    # price = re.sub(" ", '%', price)
    price = re.sub(",", ".", price)
    price = price.replace(u'\xa0', u'')
    price = re.findall(r'[0-9]*\.[0-9]*', price)
    price = float(price[0])
    prod_currency = currency.ron
    image = soup.find("div", attrs={"class": "gallery_image slide"}).img['src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_footshop(soup):
    title = soup.find("h1").text.strip()
    price = soup.find("p", attrs={"class": "ProductProperties_price_1rMbi"}).text.strip()
    price = re.sub("cu TVA", '', price)
    price = re.sub("Lei", '', price)
    price = float(price)
    prod_currency = currency.ron
    image = "no image"
    # image = soup.find("img", attrs={"class": "ImageSlider_image_2Vl4h"}).text.strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_marso(soup):
    title = soup.find("title").text.strip()
    price = find_price(soup, "div", "retail-price-brutto")
    price = re.sub("LEI", '', price)
    price = re.sub(",", '.', price)
    price = float(price)
    prod_currency = currency.ron
    image = soup.find("img", attrs={"class": "product-image ui centered middle aligned image"})['src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_intersport(soup):
    title = soup.find("title").text.strip()
    price = find_price(soup, "span", "offer")
    price = re.sub("LEI", '', price)
    price = re.sub(",", '.', price)
    price = float(price)
    prod_currency = currency.ron
    image = soup.find("div", attrs={"class": "image-container"}).img['src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data


def get_and_parse_ebay(soup):
    title = soup.find("title").text.strip()
    price = soup.find("span", attrs={"id": "prcIsum"}).text.strip()
    price = re.sub("US", '', price)
    price = re.sub("$", '', price)
    price = float(price)
    prod_currency = currency.dollar
    image = soup.find("img", attrs={"id": "icImg"})['src'].strip()
    product_data = class_ProductData.ProductData(title, price, prod_currency, image)
    return product_data
