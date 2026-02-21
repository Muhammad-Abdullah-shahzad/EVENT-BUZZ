import { useContext } from 'react';
import { Container, Accordion, Row, Col, Card, Form, InputGroup } from 'react-bootstrap';
import { HiOutlineSearch, HiOutlineBookOpen, HiOutlineCreditCard, HiOutlineTicket, HiOutlineUserGroup } from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import LanguageContext from '../../context/LanguageContext';

const HelpCenter = () => {
    const { t, language } = useContext(LanguageContext);

    const faqCategories = [
        { id: 'general', title: t('general'), icon: <HiOutlineBookOpen size={24} /> },
        { id: 'bookings', title: t('bookings'), icon: <HiOutlineTicket size={24} /> },
        { id: 'payments', title: t('payments'), icon: <HiOutlineCreditCard size={24} /> },
        { id: 'organizers', title: t('organizers'), icon: <HiOutlineUserGroup size={24} /> },
    ];

    const faqs = [
        { q: t('faq_q1'), a: t('faq_a1'), category: 'bookings' },
        { q: t('faq_q2'), a: t('faq_a2'), category: 'payments' },
        { q: t('faq_q3'), a: t('faq_a3'), category: 'bookings' },
        { q: t('faq_q4'), a: t('faq_a4'), category: 'organizers' },
    ];

    return (
        <div className="bg-light min-vh-100 pb-5">
            <Navbar />

            {/* Help Header */}
            <div className="bg-primary text-white py-5 mb-5 text-center position-relative overflow-hidden">
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-noise opacity-10"></div>
                <Container className="py-4 position-relative z-index-1">
                    <h1 className="display-4 fw-bold mb-3">{t('helpCenter')}</h1>
                    <p className="lead mb-4 opacity-75">{t('howCanWeHelp')}</p>

                    <div className="mx-auto" style={{ maxWidth: '600px' }}>
                        <InputGroup className="shadow-lg rounded-pill overflow-hidden bg-white p-1">
                            <InputGroup.Text className="bg-white border-0 ps-4">
                                <HiOutlineSearch className="text-muted" size={20} />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder={t('searchHelp')}
                                className="border-0 shadow-none py-3"
                            />
                        </InputGroup>
                    </div>
                </Container>
            </div>

            <Container>
                <Row className="g-4 mb-5 text-start">
                    {faqCategories.map(cat => (
                        <Col key={cat.id} md={3}>
                            <Card className="border-0 shadow-sm h-100 text-center p-4 hover-lift cursor-pointer bg-card">
                                <div className="text-primary mb-3 mx-auto bg-light rounded-circle p-3 w-fit-content">
                                    {cat.icon}
                                </div>
                                <h6 className="fw-bold mb-0">{cat.title}</h6>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="max-w-800 mx-auto text-start">
                    <h2 className="fw-bold mb-4 text-center">{t('faq')}</h2>
                    <Accordion defaultActiveKey="0" className="shadow-sm rounded-xl overflow-hidden border">
                        {faqs.map((faq, idx) => (
                            <Accordion.Item key={idx} eventKey={idx.toString()} className="border-0 border-bottom">
                                <Accordion.Header className="fw-bold py-2">{faq.q}</Accordion.Header>
                                <Accordion.Body className="text-muted bg-white">
                                    {faq.a}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </div>

                <div className="text-center mt-5 py-4">
                    <p className="text-muted">{t('contactUs')}</p>
                    <h5 className="fw-bold text-primary">support@eventbuzz.pk</h5>
                </div>
            </Container>
        </div>
    );
};

export default HelpCenter;
