import React, { PropTypes, Component } from 'react';
import Header from '../containers/headerContainer';
import Footer from '../containers/footerContainer';

let $ = window.$;

class ContactPage extends Component {
    constructor(props) {
        super(props);
        this.touchStart = this.touchStart.bind(this);
        this.touchEnd = this.touchEnd.bind(this);
    }

    componentDidMount() {
        //   $('.grayscale-container').on('mouseenter mouseleave', function (e){
        //     console.log('mouseleave/mouseenter');
        //     $('.grayscale', this).toggleClass('hover grayscale-off');
        //     $(this).find('.post-link').toggle();
        // });

        document.title = "Adaptabi - Skills, processes and innovation";

        this.$icons = $(this.refs.article).find('.grayscale-container img, .processes i')
            .on('touchstart mouseenter', this.touchStart).on('touchend mouseleave', this.touchEnd);
    }

    componentWillUnmount() {
        this.$icons.off('touchstart mouseenter', this.touchStart).off('touchend mouseleave', this.touchEnd);
    }

    touchStart(event) {
        $(event.currentTarget).addClass('hover');
    }

    touchEnd(event) {
        setTimeout(() => { $(event.currentTarget).removeClass('hover'); }, 250);
    }

    render() {
        return (
            <article className="page page-contact" ref="article">
                <Header ref={'header'} title={'Contact Us'} highlightContact />
                <section className="content">
                    <div className="spacer-100"/>
                    <div className="row">
                        <ul className="large-18 large-offset-3 medium-22 medium-offset-1 small-22 small-offset-1 columns">
                            <li className="content-item e-mail"><span className="bold">E-mail: </span> <a href="mailto:contact@adaptabi.com?subject=Inquiry"><span>contact@adaptabi.com</span></a></li>
                        </ul>
                    </div>
                    <div className="spacer-20"/>
                    <div className="row">
                        <ul className="large-18 large-offset-3 medium-22 medium-offset-1 small-22 small-offset-1 columns">
                            <li className="content-item bold">Romania: </li>
                            <li className="content-item"><span className="no-break">Sos.Tudor Neculai</span> <span className="no-break">nr.52 D, </span> <span className="no-break">Iasi, </span> 700732</li>
                            <li className="content-item"><a href="tel:+40729046526"><span>+40</span> <span>729 </span> <span>046</span> <span>526</span></a></li>
                        </ul>
                    </div>
                    <div className="spacer-20"/>
                    <div className="row">
                        <ul className="large-18 large-offset-3 medium-22 medium-offset-1 small-22 small-offset-1 columns">
                            <li className="content-item bold">United Kingdom: </li>
                            <li className="content-item"><span className="no-break">Prospect House, </span> <span className="no-break">2 Athenaeum Rd, </span> <span className="no-break">London, </span> <span className="no-break">N20 9AE</span></li>
                            <li className="content-item"><a href="tel:+4407956809631"><span>+44</span> <span>(0) </span> <span>795 </span> <span>680</span> <span>9631</span></a></li>
                        </ul>
                    </div>                    
                    <div className="spacer-20"/>
                    <div className="row">
                        <div className="large-18 large-offset-3 medium-22 medium-offset-1 small-22 small-offset-1 columns">
                            <h1 className="content-item">Everything changes but our passion!</h1>
                        </div>
                    </div>
                    <div className="row">
                        <ul className="large-18 large-offset-3 medium-22 medium-offset-1 small-22 small-offset-1 columns">
                            <li className="content-item social-media">
                                <a target="_blank" href="http://lnked.in/adaptabi" className="linkedin"><i className="ncs-linkedin-square" /></a>
                                <a target="_blank" href="https://www.facebook.com/adaptabi/" className="facebook"><i className="ncs-facebook-square" /></a>
                                <a target="_blank" href="https://twitter.com/adaptabidev" className="twitter"><i className="ncs-twitter" /></a>
                                <a target="_blank" href="https://blog.adaptabi.com" className="medium"><i className="ncs-medium" /></a>
                            </li>
                        </ul>
                    </div>
                    <div className="spacer-60" />
                </section>
                <Footer />
            </article>
        );
    }
}

ContactPage.propTypes = {
    strings: PropTypes.object.isRequired,
};

ContactPage.defaultProps = {
    strings: {
    },
};

export default ContactPage;
