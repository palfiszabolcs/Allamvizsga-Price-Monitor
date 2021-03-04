// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility that Flutter provides. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:price_monitor/main.dart';
import 'package:price_monitor/Screens/home.dart';

void main() {
  test("Domain Parsing Test", (){

    String urlEmag = "https://www.emag.ro/saltea-fitness-yoga-pilates-aerobic-progressive-dimensiuni-183-x-60-x-1-2-cm-nbr-culoare-negru-pro120-black/pd/DG9NJ7MBM/?ref=profiled_categories_m_home_1_1&provider=rec&recid=rec_50_e8c7365e2882845ad63b0ecb8addecc6b48646128e857322d8ed9e667c362893_1614065925&scenario_ID=50";
    String urlFlanco = "https://www.flanco.ro/televizor-smart-led-lg-55un71003lb-138-cm-ultra-hd-4k.html";
    String urlQuick = "https://www.quickmobile.ro/laptopuri/tastaturi/logitech-tastatura-bluetooth-k380-negru-211182";
    String urlHervis = "https://www.hervis.ro/store/Incaltaminte/Adidasi-Alergare/Running/Nike/Nike-Downshifter-10/p/COLOR-2834459";

    bool domainEmag = DomainParser.validateDomain(urlEmag);
    bool domainFlanco = DomainParser.validateDomain(urlFlanco);
    bool domainQuick = DomainParser.validateDomain(urlQuick);
    bool domainHervis = DomainParser.validateDomain(urlHervis);

    expect(domainEmag, true);
    expect(domainFlanco, true);
    expect(domainQuick, true);
    expect(domainHervis, false);

    // should fail
    expect(domainHervis, true);

  });
}
