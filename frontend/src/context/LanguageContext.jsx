import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        discover: 'Discover',
        dashboard: 'Dashboard',
        createEvent: 'Create Event',
        adminPanel: 'Admin Panel',
        myBookings: 'My Bookings',
        login: 'Login',
        joinNow: 'Join Now',
        logout: 'Logout',
        profile: 'Profile',
        notifications: 'Notifications',
        noNotifications: 'No notifications yet',
        new: 'New',
        viewAll: 'View all',
        searchPlaceholder: 'What are you looking for?',
        featuredEvents: 'Featured Events',
        upcomingEvents: 'Upcoming Events',
        categories: 'Categories',
        filters: 'Filters',
        all: 'All',
        price: 'Price',
        location: 'City or Venue...',
        clearAll: 'Clear All',
        noEvents: 'No events found matching your criteria.',
        loading: 'Loading events...',
        exploreMap: 'Explore on Map',
        hideMap: 'Hide Map',
        ticketsLeft: 'tickets left',
        free: 'FREE',
        details: 'View Details',
        about: 'About Event',
        venue: 'Venue Address',
        ticketAvailable: 'Tickets Available',
        buyTicket: 'Buy Ticket Now',
        bookingSuccess: 'Booking Successful!',
        share: 'Share',
        days: 'Days',
        hours: 'Hours',
        mins: 'Mins',
        secs: 'Secs',
        timeLeft: 'Time Left',
        reviews: 'Reviews',
        addReview: 'Add your review',
        gallery: 'Event Gallery',
        helpCenter: 'Help Center',
        faq: 'Frequently Asked Questions',
        howCanWeHelp: 'How can we help you?',
        searchHelp: 'Search for articles, guides...',
        general: 'General',
        bookings: 'Bookings',
        payments: 'Payments',
        organizers: 'For Organizers',
        contactUs: 'Still need help? Contact Us',
        faq_q1: 'How do I book a ticket?',
        faq_a1: 'Find an event you like, click on "View Details", select the number of tickets, and click "Buy Ticket" or "Reserve Spot".',
        faq_q2: 'Is payment secure?',
        faq_a2: 'Yes, we use industry-standard encryption and secure payment gateways (Stripe/PayFast) to protect your data.',
        faq_q3: 'Can I cancel my booking?',
        faq_a3: 'Cancellation policies vary by event. Please check the event description or contact the organizer directly.',
        faq_q4: 'How do I list my own event?',
        faq_a4: 'Register as an Organizer, go to your Dashboard, and click on "Create Event" to start listing your happenings.',
    },
    ur: {
        discover: 'دریافت کریں',
        dashboard: 'ڈیش بورڈ',
        createEvent: 'ایونٹ بنائیں',
        adminPanel: 'ایڈمن پینل',
        myBookings: 'میری بکنگ',
        login: 'لاگ ان',
        joinNow: 'ابھی شامل ہوں',
        logout: 'لاگ آؤٹ',
        profile: 'پروفائل',
        notifications: 'اطلاعات',
        noNotifications: 'ابھی کوئی اطلاع نہیں ہے',
        new: 'نیا',
        viewAll: 'سب دیکھیں',
        searchPlaceholder: 'آپ کیا تلاش کر رہے ہیں؟',
        featuredEvents: 'نمایاں ایونٹس',
        upcomingEvents: 'آنے والے ایونٹس',
        categories: 'اقسام',
        filters: 'فلٹرز',
        all: 'تمام',
        price: 'قیمت',
        location: 'شہر یا جگہ...',
        clearAll: 'سب صاف کریں',
        noEvents: 'آپ کے معیار کے مطابق کوئی ایونٹ نہیں ملا۔',
        loading: 'ایونٹس لوڈ ہو رہے ہیں...',
        exploreMap: 'نقشے پر دیکھیں',
        hideMap: 'نقشہ چھپائیں',
        ticketsLeft: 'ٹکٹ باقی ہیں',
        free: 'مفت',
        details: 'تفصیلات دیکھیں',
        about: 'ایونٹ کے بارے میں',
        venue: 'مقام کا پتہ',
        ticketAvailable: 'ٹکٹ دستیاب ہیں',
        buyTicket: 'ابھی ٹکٹ خریدیں',
        bookingSuccess: 'بکنگ کامیاب رہی!',
        share: 'شیئر کریں',
        days: 'دن',
        hours: 'گھنٹے',
        mins: 'منٹ',
        secs: 'سیکنڈ',
        timeLeft: 'باقی وقت',
        reviews: 'تبصرے',
        addReview: 'اپنا تبصرہ شامل کریں',
        gallery: 'ایونٹ گیلری',
        helpCenter: 'مدد مرکز',
        faq: 'اکثر پوچھے گئے سوالات',
        howCanWeHelp: 'ہم آپ کی کیسے مدد کر سکتے ہیں؟',
        searchHelp: 'مضامین، رہنمائی تلاش کریں...',
        general: 'عام',
        bookings: 'بکنگ',
        payments: 'ادائیگی',
        organizers: 'آرگنائزرز کے لیے',
        contactUs: 'مزید مدد چاہیے؟ ہم سے رابطہ کریں',
        faq_q1: 'میں ٹکٹ کیسے بک کروں؟',
        faq_a1: 'اپنی پسند کا ایونٹ تلاش کریں، "تفصیلات دیکھیں" پر کلک کریں، ٹکٹوں کی تعداد منتخب کریں، اور "ٹکٹ خریدیں" یا "جگہ بک کریں" پر کلک کریں۔',
        faq_q2: 'کیا ادائیگی محفوظ ہے؟',
        faq_a2: 'جی ہاں، ہم آپ کے ڈیٹا کی حفاظت کے لیے انڈسٹری کے معیاری انکرپشن اور محفوظ ادائیگی کے گیٹ ویز استعمال کرتے ہیں۔',
        faq_q3: 'کیا میں اپنی بکنگ منسوخ کر سکتا ہوں؟',
        faq_a3: 'منسوخی کی پالیسیاں ہر ایونٹ کے لیے مختلف ہوتی ہیں۔ براہ کرم ایونٹ کی تفصیل چیک کریں یا براہ راست آرگنائزر سے رابطہ کریں۔',
        faq_q4: 'میں اپنا ایونٹ کیسے لسٹ کروں؟',
        faq_a4: 'بطور آرگنائزر رجسٹر ہوں، اپنے ڈیش بورڈ پر جائیں، اور اپنے ایونٹس لسٹ کرنے کے لیے "ایونٹ بنائیں" پر کلک کریں۔',
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

    const toggleLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    useEffect(() => {
        document.dir = language === 'ur' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            <div style={{ direction: language === 'ur' ? 'rtl' : 'ltr' }}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
};

export default LanguageContext;
