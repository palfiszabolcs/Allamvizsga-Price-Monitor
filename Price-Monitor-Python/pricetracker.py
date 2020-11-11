import requests
from bs4 import BeautifulSoup
from dacite import from_dict
from firebase import firebase as fb
from datetime import date
from datetime import datetime
import schedule
import time

import Classes.class_FirebaseResponse
from Util import test_urls as test_url, database, constants as constant, util_functions as util, category as cat


def get_url_info(url):
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print("Getting information from URL... - " + current_time)
    html_content = requests.get(url).text
    soup = BeautifulSoup(html_content, "html.parser")
    address = util.get_site_address(url)

    if address == "emag.ro":
        return util.get_and_parse_emag(soup)

    # if address == "mediagalaxy.ro":
    #     return util.get_and_parse_mediagalaxy(soup)

    if address == "flanco.ro":
        return util.get_and_parse_flanco(soup)

    # if address == "cel.ro":
    #     return util.get_and_parse_cel(soup)

    # if address == "dedeman.ro":
    #     return util.get_and_parse_dedeman(soup)

    # if address == "autovit.ro":
    #     return util.get_and_parse_autovit(soup)

    # if address == "altex.ro":
    #     return util.get_and_parse_altex(soup)

    # if address == "evomag.ro":
    #     return util.get_and_parse_evomag(soup)

    if address == "quickmobile.ro":
        return util.get_and_parse_quickmobile(soup)

    # if address == "gymbeam.ro":
    #     return util.get_and_parse_gymbeam(soup)

    # if address == "megaproteine.ro":
    #     return util.get_and_parse_megaproteine(soup)

    # if address == "sportisimo.ro":
    #     return util.get_and_parse_sportisimo(soup)

    # if address == "footshop.eu":
    #     return util.get_and_parse_footshop(soup)

    # if address == "marso.ro":
    #     return util.get_and_parse_marso(soup)

    # if address == "intersport.ro":
    #     return util.get_and_parse_intersport(soup)

    # # !!!!! Resolve exception when advert is no longer active !!!!
    # if address == "ebay.com":
    #     return util.get_and_parse_ebay(soup)


def push_new_data_to_db(user, url):
    print("Pushing to database...")
    data = get_url_info(url)
    if data is None:
        return

    firebase = fb.FirebaseApplication(database.firebase_link, None)
    # firebase = fb.FirebaseApplication(database.bakcup_firebase_link, None)

    product_data = {
        'url': url,
        'name': data.title,
        'currency': data.currency,
        'image': data.image,
    }

    response = firebase.post("USERS/" + user, product_data)
    prod_id = from_dict(Classes.class_FirebaseResponse.FireBaseResponse, response).name

    check_data = {
        'price': data.price,
        'date': date.today()
    }
    response_check = firebase.post("USERS/" + user + "/" + prod_id + "/check", check_data)

    print("Added " + user + "to database")
    print("----------------")

    return prod_id


def delete_user(user):
    firebase = fb.FirebaseApplication(database.firebase_link, None)
    delete_result = firebase.delete("/NEW", user)
    return delete_result


# goes over all new users or existing users who added new products and ads them to the main USERS folder
def update_users_new_products():
    users_list = util.get_new_users()
    if users_list == "none":
        now = datetime.now()
        current_time = now.strftime("%H:%M:%S")
        print("----------------")
        print("No new product added! - " + current_time)
        print("----------------")
        return 0
    print("Updating users...")
    print("----------------")

    for user in users_list:
        users_product_list = util.make_new_product_list(user)
        for item in users_product_list:
            push_new_data_to_db(user, item.product.url)
        print("Product added to " + user + "'s list...")
        print("Deleting " + user + " from NEW section")
        delete_result = delete_user(user)
        print("----------------")


def update_prices():
    users_list = util.get_existing_users()
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print("Updating prices... - " + current_time)
    print("----------------")
    for user in users_list:
        users_product_list = util.make_product_list(user)
        for item in users_product_list:
            product_data = get_url_info(item.product_data.url)
            if product_data:
                price = product_data.price
            else:
                price = "error"
                util.upload_error(user, item.product_id, date.today(), item.product_data.url)
                print("!!! ERROR FOUND !!!")
                # print("----------------")
            # print(user + ":" + item.product_data.name + ": (" + str(price) + "," + str(cur_date) + ")")
            res = util.upload_check_data(user, item.product_id, price, date.today())

            # TODO: sleep is here
            # time.sleep(60)

        now = datetime.now()
        current_time = now.strftime("%H:%M:%S")
        print("Updated " + user + "'s products prices - " + current_time)
        print("----------------")

# ############################################ - MAIN - ####################################################

# update_users_new_products()
# update_prices()


schedule.every(4).minutes.do(update_users_new_products)
schedule.every().day.at('10:50').do(update_prices)

while True:
    schedule.run_pending()
    time.sleep(60)

# ############################################ - TEST BENCH - ####################################################


# bad_url1 = "https://www.flanco.ro/apple-watch-series-5-gps-44mm-space-grey-aluminium-case-black-sport-band.html"
# bad_url2 = "https://altex.ro/boxe-audio-5-0-jamo-s-628-hcs-negru/cpd/BOXS628HCSBA/"
# url = "https://www.quickmobile.ro/entertainment/boxe-portabile/harman-kardon-boxa-portabila-onyx-studio-6-albastru-206775"
# url = "https://www.emag.ro/laptop-ultraportabil-asus-vivobook-s14-s431fa-cu-procesor-intelr-coretm-i5-8265u-pana-la-3-90-ghz-whiskey-lake-14-full-hd-8gb-512gb-ssd-intel-uhd-graphics-620-cobalt-blue-s431fa-eb109/pd/D7FJBBMBM/?X-Search-Id=7836a5027a92fd6c970e&X-Product-Id=6379059&X-Search-Page=1&X-Search-Position=0&X-Section=search&X-MB=0&X-Search-Action=view"
# url1 = "https://www.emag.ro/laptop-asus-ux434fa-cu-procesor-intelr-coretm-i5-10210u-pana-la-4-20-ghz-14-0-full-hd-8gb-512gb-ssd-intel-uhd-graphics-620-windows-10-home-royal-blue-ux434fac-a5099t/pd/DCXTCMMBM/?ref=similar_products_7_7&provider=rec&recid=rec_4_6b697c07a21e33ab60b4a81989fb18624f7cdd306cbd29da3b035a1d7564486f_1598535173&scenario_ID=4"
# url2 = "https://www.emag.ro/masina-electrica-de-tuns-gazonul-bosch-arm-32-3200-1200w-32cm-sac-31l-0600885b03/pd/DD8TVMBBM/?ref=prod_CMP-62795_5759_66266"
# url3 = "https://www.flanco.ro/apple-watch-series-5-gps-44mm-silver-aluminium-case-white-sport-band.html"
# url4 = "https://www.flanco.ro/televizor-smart-led-samsung-ue50tu8072-125-cm-ultra-hd-4k.html"
# url5 = "https://www.emag.ro/laptop-ultraportabil-huawei-matebook-14-cu-procesor-amd-ryzen-5-4600h-pana-la-4-00-ghz-14-2k-16gb-512gb-ssd-amd-radeon-graphics-windows-10-home-gray-53011gsl/pd/D0S8F2MBM/?ref=graph_profiled_similar_a_1_6&provider=rec&recid=rec_49_16_c2732421_91_A_1517324c2705b459d50c09a7baac7b896babac44682d2ccc365f0110b5e2b416_1602743842&scenario_ID=49"
# url6 = "https://altex.ro/televizor-led-smart-samsung-43tu7172-ultra-hd-4k-hdr-108-cm/cpd/UHDUE43TU7172UX/"
# url7 = "https://mediagalaxy.ro/laptop-gaming-lenovo-legion-5-17imh05-intel-core-i5-10300h-pana-la-4-5ghz-17-3-full-hd-8gb-ssd-512gb-nvidia-geforce-gtx-1650-4gb-free-dos-negru/cpd/LAP82B3002SRM/"
# url8 = "https://www.emag.ro/boxa-portabila-jbl-charge-3-6000-mah-rosu-charge3red/pd/DCQG32BBM/#used-products"

# test = get_url_info(url8)
# print(test)

# html_content = requests.get(url8).text
# print(html_content)
# soup = BeautifulSoup(html_content, "html.parser")
# print(soup)


# price = soup.find("span", attrs={"class": "label-out_of_stock"})
# print(price)



# ############################################ - TEST BENCH - ####################################################
# test = get_url_info(bad_url2)
# if test:
#     print("ok")
# else:
#     util.upload_error("user", "id", date.today(), bad_url2)
