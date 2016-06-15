import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import routePaths from '../../common/routePaths';
//import HeaderLinks from '../containers/headerLinksContainer';
import Burger from './burger';
import _ from 'lodash';
import dom from 'react-dom';

let $ = window.$, $window = $(window), ScrollMagic = window.ScrollMagic, TweenMax = window.TweenMax, Power3 = window.Power3, TimelineLite = window.TimelineLite;

class Header extends Component {
    constructor(props) {
        super(props);
        this.handleHomepageClick = this.handleHomepageClick.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.burgerClick = this.burgerClick.bind(this);
        this.openContact = this.openContact.bind(this);
        this.closeContact = this.closeContact.bind(this);
    }
    
    /////
    //    HEADER MENU ANIMATION - when scrolling
    ////////////////////////////////////////////////////

    componentDidMount() {
        if (this.props.linksOnly) { //disabled on homepage
            return;
        }
        var controller = new ScrollMagic.Controller();
        this.controller = controller;
        var timeLines = this.timeLines = [];
        var scenes = this.scenes = [];
        let header = dom.findDOMNode(this.refs.header), $header = $(header),
            $container = $header.parent(), 
            headerBottom = $header.position().top + $header.height(),
            $links = $header.find('nav ul li a'),
            logo = $header.find('> .logo'),
            burger = $header.find('.hamburglar');          
        
        function hideMenuLinks() {
            let t = [];
            $links.each(function(){
                t.push(TweenMax.to(this, 1, { x: '-100%' }));
            });
            timeLines = timeLines.concat(t);
            return t;
        }
        
        function moveLogo(){
            let t = TweenMax.to(logo, 1, { marginLeft: '50px', width: '-=50px' });
            timeLines.push(t);
            return t;
        }
        function makeLogoDark() {
            let t = TweenMax.to(logo, 1, { color: '#4d4d4d' });
            timeLines.push(t);
            return t;
        }
        
        function moveBurger() {
            let t = TweenMax.to(burger, 1, { marginLeft: 0 });
            timeLines.push(t);
            return t;
        }
        function makeBurgerDark() {
            let t = TweenMax.to(burger, 1, { color: '#4d4d4d' });
            timeLines.push(t);
            return t;
        }
        
        // change behaviour of controller to animate scroll instead of jump
        controller.scrollTo(function (newpos) {
            var t = TweenMax.to(window, .7, { scrollTo: { y: newpos }, ease: Power3.easeOut });
            timeLines.push(t);
            return t;
        });
        
        // scenes.push(new ScrollMagic.Scene({ triggerElement: $container, triggerHook: 'onLeave', duration: 310, offset: 90 }).addTo(controller)
        //     .addIndicators({name:'1'})
        //     .on('start', event => {
        //         if (event.scrollDirection == 'FORWARD') {
        //             controller.scrollTo(headerBottom);
        //         }
        //     })
        //     .on('end', event => {
        //         if (event.scrollDirection == 'FORWARD') {
        //             $container.addClass('fix-header');
        //         }
        //         if (event.scrollDirection == 'REVERSE') {
        //             $container.removeClass('fix-header');
        //             controller.scrollTo(header);
        //         }
        //     })
        //     .setTween(tweens)
        // );

        let tweensForScene1 = hideMenuLinks().concat([moveLogo(), moveBurger()]);
        scenes.push(new ScrollMagic.Scene({ triggerElement: $container, triggerHook: 'onLeave', duration: 90, offset: 0 }).addTo(controller)
            //.addIndicators({name:'Scene 1'})
            .on('end', event => {
                if (event.scrollDirection == 'FORWARD') {   
                    controller.scrollTo(headerBottom);
                }
            })
            .on('progress', event => {
                if (event.scrollDirection == 'FORWARD' && event.progress > .3) {
                    $container.addClass('links-hidden');
                }
                if (event.scrollDirection == 'REVERSE' && event.progress <= .3) {
                    $container.removeClass('links-hidden');
                }
            })
            .setTween(tweensForScene1)
        );   

        let tweensForScene2 = [ makeLogoDark(), makeBurgerDark() ];
        scenes.push(new ScrollMagic.Scene({ triggerElement: $container, triggerHook: 'onLeave', duration: 40, offset: 360 }).addTo(controller)
            //.addIndicators({name:'Scene 2'})
            .on('end', event => {
                if (event.scrollDirection == 'FORWARD') {
                    $container.addClass('fix-header');
                }
                if (event.scrollDirection == 'REVERSE') {
                    $container.removeClass('fix-header');
                    controller.scrollTo(0);
                }
            })
            .setTween(tweensForScene2)
        );   
    }

    componentWillUnmount() {
        if (this.scenes) {
            for (var i = 0; i < this.scenes.length; i++) {
                this.scenes[i].destroy();
                this.scenes[i] = null;
            }
        }
        if (this.timeLines) {
            for (i = 0; i < this.timeLines.length; i++) {
                this.timeLines[i] = null;
            }
        }
        if (this.controller) {
            this.controller.destroy();
            this.controller = null;
        }
    }
  
    /////
    //    HANDLE CLICKS
    ////////////////////////////////////////////////////

    handleHomepageClick(event) {
        this.handleClick(event, 1);
    }
    
    handleClick(event, column) {
        let el = this.getElements(), burgerIsOpen = el.burger.is('.is-open');        
        if (burgerIsOpen) {
            this.resetAnimating.bind(this, false, false);
            $window.scrollTop(0);
        }    
        this.props.transition({
            type: burgerIsOpen && 'burger' || 'header',
            column: column || event.target.getAttribute('data-animate-line'),
            target: event.currentTarget,
        });
    }
    
    /////
    //    BURGER MENU
    ////////////////////////////////////////////////////

    burgerClick(event){
        if (this.animating) {
            return false;
        }
        this.animating = true;
        let $burger = $(event.currentTarget);
        $burger.is('.is-closed') && this.openBurgerMenu() || this.closeBurgerMenu();
        $burger.toggleClass('is-closed is-open');
    }
    
    openBurgerMenu() {
        let el = this.getElements();
        let timeLines = this.timeLines;
        let _this = this;

        this.wasFixedBurger = el.container.hasClass('fix-header');
        
        let animations = _.filter([
            () => { el.text.hide(); },
            TweenMax.to(el.logo, .6, { color: '#fefefe', marginLeft: '12.5%', ease: Power3.easeOut }),
            TweenMax.to(el.burger, .3, { color: '#fefefe', ease: Power3.easeOut }),
            TweenMax.to(el.header, .6, { height: '100%', ease: Power3.easeOut }),
        ].concat(el.links.toArray().map(link => { return TweenMax.to(link, .3, { x: '0%', delay: .3 }); })));
        
        timeLines.push(new TimelineLite({ onComplete: () => {
                _this.resetAnimating(true);
                el.container.addClass('fix-header');
                $(el.logo).css('pointer-events', 'all');
            }})
            .add(animations)
        );
        
        return true; //important! otherwise burgerClick will call both open AND close!
    }

    closeBurgerMenu() {
        let el = this.getElements();
        let timeLines = this.timeLines;
        let _this = this;
        
        let animations = _.filter([
            TweenMax.to(el.logo, .6, { marginLeft: '50px', ease: Power3.easeOut }),
            TweenMax.to(el.logo, .3, { color: '#4d4d4d', delay: .3, ease: Power3.easeOut }), 
            TweenMax.to(el.burger, .3, { color: '#4d4d4d', delay: .3, ease: Power3.easeOut }),
            TweenMax.to(el.header, .6, { height: _this.wasFixedBurger ? '0%' : '400px', ease: Power3.easeOut }),
        ]);
        
        $(el.logo).css('pointer-events', '');
        timeLines.push(new TimelineLite({ onComplete: () => {
                _this.resetAnimating(false);
                !_this.wasFixedBurger && el.container.removeClass('fix-header');
                el.header.css('height', '');
            }})
            .add(el.links.toArray().map(link => { return TweenMax.to(link, .3, { x: '-100%' }); }))
            .add(animations)
            .add(_.filter([() => { el.text.show(); el.header.css('height', ''); }]))     
            .add(() => { $(el.logo).css('margin-left', ''); })       
        );
    }
    
    resetAnimating(lock, restoreScroll) {
        this.animating = false;
        lock && this.disableScenes();
        $.scrollLock(lock, restoreScroll);
        !lock && setTimeout(this.enableScenes.bind(this), 100);
    }

    disableScenes() {
        this.scenes && this.scenes.forEach(scene => { scene.enabled(false); });
    }

    enableScenes() {
        this.scenes && this.scenes.forEach(scene => { scene.enabled(true); });
    }
    
    getElements() {
        let header = $(dom.findDOMNode(this.refs.header)), 
            burger = header.find('.hamburglar');
        return { burger, header,
            links: header.find('nav ul li a'),
            logo: header.find('> .logo'),
            text: header.find('> .text h1'),
            image: header.find('> .image .img'),
            contact: header.find('.contact-container .content'),
            closeContact: header.find('.contact-container .close'),
            container: header.closest('article.page'),
        };
    }

    /////
    //    CONTACT PAGE
    ////////////////////////////////////////////////////

    openContact(event) {
        let el = this.getElements(), burgerIsOpen = el.burger.is('.is-open'), animations = [];      
        let timeLines = this.timeLines || (this.timeLines = []);
        let _this = this;
        this.wasFixed = el.container.hasClass('fix-header');

        if (!burgerIsOpen) {
            animations = _.filter([
                this.wasFixed && TweenMax.to(el.logo, .6, { color: '#fefefe', marginLeft: '12.5%', ease: Power3.easeOut })
                    || TweenMax.set(el.logo, { color: '#fefefe', marginLeft: '12.5%', ease: Power3.easeOut }),
                TweenMax.to(el.burger, .3, { color: '#fefefe', ease: Power3.easeOut }),
                TweenMax.to(el.header, .6, { height: '100%', ease: Power3.easeOut }),
            ]);
        } else {
            animations = _.filter([
                el.burger && TweenMax.to(el.burger, .3, { x: '-100%', ease: Power3.easeIn }),
                el.closeContact && TweenMax.to(el.closeContact, .3, { x: '0%', delay: .3, ease: Power3.easeOut }),
            ]);
        }
        
        animations = animations
            .concat(el.links.toArray().map(link => { return TweenMax.to(link, .3, { x: '-100%', delay: burgerIsOpen ? 0 : .3, ease: Power3.easeIn }); })
            .concat(el.contact.toArray().map(text => { return TweenMax.to(text, .3, { x: '0%', delay: burgerIsOpen ? .3 : .6, ease: Power3.easeOut }); })));
        
        
        let initialState = el.contact.toArray().map(text => { return TweenMax.set(text, { x: '-100%' }); });

        let middleState = [];
        if (!this.wasFixed) {
            middleState = _.filter([
                el.image && TweenMax.to(el.image, .3, { opacity: 0, scale: 2, ease: Power3.easeIn }),
                TweenMax.to(el.text, .3, { x: '-100%', ease: Power3.easeIn }),
            ]).concat(el.links.toArray().map(link => { return TweenMax.to(link, .3, { x: '-100%', ease: Power3.easeIn }); }));
        }        

        !burgerIsOpen && _this.resetAnimating(true);
        timeLines.push(new TimelineLite({ onComplete: () => {
                el.header.find('.contact-container .contact').css('z-index', '5'); //more than header links
                $(el.logo).css('pointer-events', 'all');
            }})
            .add(initialState)
            .add(middleState)
            .add(() => { el.container.addClass('fix-header'); })
            .add(animations)
        );

        event.preventDefault();
        return false;
    }

    closeContact(event) {
        let el = this.getElements(), burgerIsOpen = el.burger.is('.is-open'), animations = [], postAnimations = [];      
        let timeLines = this.timeLines || (this.timeLines = []);
        let _this = this;
        let initialState = el.contact.toArray().map(text => { return TweenMax.set(text, { x: '0%' }); });
        
        if (burgerIsOpen) {
            animations = _.filter([
                    el.burger && TweenMax.to(el.burger, .3, { x: '0%', delay: .3, ease: Power3.easeOut }),            
                ])
                .concat(el.links.toArray().map(link => { return TweenMax.to(link, .3, { x: '0%', delay: .3, ease: Power3.easeOut }); }))
                .concat(el.contact.toArray().map(text => { return TweenMax.to(text, .3, { x: '-100%', ease: Power3.easeIn }); }));
        } else {
            el.header.addClass('align-links-top');
            initialState = initialState.concat(_.filter([
                !this.wasFixed && el.image && TweenMax.set(el.image, { scale: 2, opacity: 0 }),
            ]));
            animations = el.contact.toArray().map(text => { return TweenMax.to(text, .3, { x: '-100%', ease: Power3.easeIn }); });
            postAnimations = _.filter([
                this.wasFixed && TweenMax.to(el.logo, .6, { marginLeft: '50px', ease: Power3.easeOut }),
                this.wasFixed && TweenMax.to(el.logo, .3, { color: '#4d4d4d', delay: .3, ease: Power3.easeOut }), 
                TweenMax.to(el.burger, .3, { color: '#4d4d4d', delay: .3, ease: Power3.easeOut }),
                TweenMax.to(el.header, .6, { height: '400px', ease: Power3.easeOut }),
                TweenMax.to(el.text, .3, { x: '0%', delay: .3, ease: Power3.easeOut }),
                !this.wasFixed && el.image && TweenMax.to(el.image, .5, { opacity: 1, ease: Power3.easeIn }),
                !this.wasFixed && el.image && TweenMax.to(el.image, .6, { scale: 1, ease: Power3.easeOut }),
            ])
            .concat(el.links.toArray().map(link => { return TweenMax.to(link, .3, { x: '0%', delay: .3, ease: Power3.easeOut }); }));
        }
        
        timeLines.push(new TimelineLite({ onComplete: () => {
                !burgerIsOpen && _this.resetAnimating(false);
                !_this.wasFixed && el.container.removeClass('fix-header');                
                el.header.removeClass('align-links-top');
                el.header.find('.contact-container .contact').css('z-index', ''); //default, less than header links
                !burgerIsOpen && el.header.css('height', '');
                el.logo.css('pointer-events', 'all');
            }})
            .add(initialState)
            .add(animations)
            .add(postAnimations)
        );

        event.preventDefault();
        return false;
    }

    /////
    //    RENDER
    ////////////////////////////////////////////////////

    render() {
        const logo = (<Link to={routePaths.client.root} onClick={this.handleHomepageClick} className="logo">
                        <svg width="131px" height="36px" viewBox="400 345 131 36">
                            <path d="M416.9332,345.0014 C420.2702,345.0014 424.0432,346.7544 427.2842,349.3764 C426.8482,349.2614 426.3902,349.1994 425.9182,349.1994 C422.9912,349.1994 420.6182,351.5724 420.6182,354.4994 C420.6182,357.4264 422.9912,359.7994 425.9182,359.7994 C428.8452,359.7994 431.2192,357.4264 431.2192,354.4994 C431.2192,354.0144 431.1532,353.5444 431.0312,353.0974 C432.8692,355.3424 434.2432,357.8334 434.8192,360.2634 C434.9282,360.7254 435.0172,361.2194 435.0662,361.7174 C435.1802,362.8694 434.4282,362.8744 433.5222,362.6644 C433.2542,362.6024 432.9902,362.5324 432.7292,362.4554 C431.8482,362.1964 431.0062,361.8564 430.2122,361.4444 C429.8302,361.2474 429.3612,361.3964 429.1632,361.7774 C428.9662,362.1594 429.1152,362.6294 429.4962,362.8264 C430.8602,363.5334 431.8702,363.7884 433.2842,364.1954 C433.8862,364.3694 434.1322,365.1894 433.5782,365.5974 C433.0392,365.9954 432.4302,366.2204 431.5352,366.2204 L421.9422,366.2204 C422.7212,366.9054 423.5442,367.8344 424.1192,368.7624 L425.3892,368.7624 C425.8162,368.7624 426.1662,369.1124 426.1662,369.5394 C426.1662,369.9664 425.8162,370.3154 425.3892,370.3154 L424.8012,370.3154 L423.3112,370.3154 L423.9072,371.5454 C424.1202,371.9154 423.9922,372.3934 423.6232,372.6064 C423.2522,372.8204 422.7752,372.6924 422.5622,372.3224 C420.8102,367.2634 416.2012,366.2294 414.1972,366.2204 L414.1972,366.2214 L414.1472,366.2204 C411.2172,366.2204 408.8422,368.5954 408.8422,371.5254 C408.8422,374.4554 411.2172,376.8304 414.1472,376.8304 C415.1232,376.8304 415.9152,376.0384 415.9152,375.0624 C415.9152,374.0854 415.1232,373.2944 414.1472,373.2944 L414.1472,373.2944 C413.1702,373.2944 412.3782,372.5024 412.3782,371.5254 C412.3782,370.5494 413.1702,369.7574 414.1472,369.7574 C417.0772,369.7574 419.4522,372.1324 419.4522,375.0624 C419.4522,377.9754 417.1042,380.3394 414.1972,380.3664 L414.1972,380.3674 L414.1472,380.3674 C406.3332,380.3674 400.0002,374.0344 400.0002,366.2204 C400.0002,358.4074 406.3332,352.0734 414.1472,352.0734 L414.1972,352.0744 L414.1972,352.0734 L414.1972,347.6524 C414.1972,346.1874 415.3852,345.0004 416.8502,345.0004 C416.8782,345.0004 416.9052,345.0004 416.9332,345.0014 M428.3452,354.3734 C427.6322,354.3734 427.0542,353.7954 427.0542,353.0824 C427.0542,352.3694 427.6322,351.7914 428.3452,351.7914 C429.0582,351.7914 429.6362,352.3694 429.6362,353.0824 C429.6362,353.7954 429.0582,354.3734 428.3452,354.3734 Z M462.4605,356.7844 L462.4555,351.9554 C462.4555,351.8654 462.4895,351.7844 462.5525,351.7204 C462.6175,351.6564 462.6975,351.6234 462.7885,351.6234 L464.3105,351.6264 C464.4925,351.6274 464.6415,351.7764 464.6415,351.9594 L464.6415,365.9034 C464.6415,365.9944 464.6065,366.0764 464.5415,366.1404 C464.4765,366.2044 464.3935,366.2364 464.3025,366.2354 L462.7865,366.2054 C462.6055,366.2024 462.4605,366.0544 462.4605,365.8734 L462.4605,365.2394 C461.8175,365.8734 460.9475,366.2324 460.0625,366.3664 C459.1065,366.5124 458.1005,366.4044 457.1925,366.0764 C456.2285,365.7294 455.3715,365.1344 454.7515,364.3154 C454.0315,363.3644 453.7155,362.2294 453.7085,361.0454 C453.7025,359.9664 453.9615,358.9204 454.5545,358.0124 C455.0745,357.2144 455.8095,356.5934 456.6655,356.1814 C458.2785,355.4044 460.3275,355.3844 461.8705,356.3444 C462.0795,356.4744 462.2765,356.6214 462.4605,356.7844 Z M496.4365,354.9184 L496.4555,354.9184 L496.4555,355.7604 L500.0885,355.7544 C500.1805,355.7544 500.2625,355.7894 500.3265,355.8544 C500.3905,355.9204 500.4235,356.0034 500.4205,356.0944 L500.3855,357.5594 C500.3805,357.7384 500.2335,357.8824 500.0535,357.8824 L496.4635,357.8824 C496.4665,359.7264 496.4985,361.5704 496.4965,363.4114 C496.5075,364.0524 497.1535,364.3234 497.7025,364.3774 C498.0745,364.4144 498.4655,364.3824 498.8305,364.3004 C498.9955,364.2624 499.1515,364.2024 499.3075,364.1384 C499.4745,364.0704 499.6395,363.9994 499.8165,363.9574 C499.9165,363.9334 500.0175,363.9554 500.0985,364.0194 C500.1805,364.0844 500.2255,364.1764 500.2255,364.2804 L500.2265,365.6104 C500.2265,365.7494 500.1435,365.8704 500.0145,365.9204 C499.6075,366.0774 499.1985,366.2364 498.7725,366.3354 C498.0985,366.4934 497.4705,366.4744 496.7965,366.3274 C495.7905,366.1084 494.9195,365.5234 494.5125,364.5524 C494.3205,364.0934 494.2735,363.4784 494.2495,362.9824 C494.2175,362.3054 494.2315,361.6264 494.2495,360.9484 L494.2545,360.7764 L494.2545,357.8464 L492.7085,357.8464 C492.6175,357.8464 492.5345,357.8114 492.4715,357.7464 C492.4075,357.6814 492.3745,357.5974 492.3765,357.5064 L492.4075,356.1324 C492.4115,355.9514 492.5595,355.8074 492.7395,355.8074 L494.2545,355.8074 L494.2545,354.9184 L494.2545,353.1544 C494.2545,353.0644 494.2885,352.9824 494.3525,352.9184 C494.4165,352.8554 494.4985,352.8214 494.5895,352.8224 L496.0665,352.8344 C496.2465,352.8364 496.3925,352.9804 496.3965,353.1594 L496.4365,354.9184 Z M529.1255,351.6534 C529.8985,351.6534 530.5265,352.2804 530.5265,353.0544 C530.5265,353.8284 529.8985,354.4554 529.1255,354.4554 C528.3515,354.4554 527.7245,353.8284 527.7245,353.0544 C527.7245,352.2804 528.3515,351.6534 529.1255,351.6534 Z M528.0345,365.9034 L528.0575,356.1384 C528.0585,355.9554 528.2075,355.8064 528.3895,355.8064 L529.8825,355.8074 C530.0655,355.8074 530.2145,355.9564 530.2145,356.1394 L530.2155,365.9064 C530.2155,365.9964 530.1815,366.0774 530.1175,366.1414 C530.0535,366.2054 529.9725,366.2384 529.8825,366.2384 L528.3665,366.2364 C528.1835,366.2364 528.0345,366.0864 528.0345,365.9034 Z M449.3675,365.2314 C449.3605,365.2374 449.3535,365.2444 449.3465,365.2504 C449.1725,365.4074 448.9815,365.5444 448.7865,365.6714 C448.3395,365.9644 447.8475,366.1594 447.3285,366.2814 C445.8405,366.6324 444.2595,366.3774 442.9785,365.5334 C441.4445,364.5214 440.6255,362.8694 440.6145,361.0454 C440.6045,359.1894 441.4455,357.5064 443.0125,356.4884 C444.2985,355.6524 445.8815,355.4014 447.3675,355.7684 C448.0335,355.9334 448.6515,356.2044 449.1875,356.6374 C449.2485,356.6864 449.3085,356.7384 449.3665,356.7904 L449.3655,356.1404 C449.3655,356.0504 449.3985,355.9694 449.4625,355.9054 C449.5265,355.8414 449.6075,355.8084 449.6975,355.8084 L451.2155,355.8084 C451.3985,355.8084 451.5475,355.9574 451.5475,356.1404 L451.5475,365.9034 C451.5475,365.9944 451.5135,366.0764 451.4485,366.1404 C451.3835,366.2044 451.3005,366.2364 451.2095,366.2354 L449.6935,366.2054 C449.5125,366.2024 449.3675,366.0544 449.3675,365.8734 L449.3675,365.2314 Z M509.9675,365.2394 C509.4645,365.7314 508.6055,366.1214 507.9295,366.2814 C506.4405,366.6324 504.8595,366.3774 503.5785,365.5334 C502.0445,364.5214 501.2255,362.8694 501.2155,361.0454 C501.2045,359.1114 502.0725,357.4054 503.7505,356.4054 C505.1935,355.5454 507.0425,355.3524 508.6135,355.9694 C509.1065,356.1624 509.5645,356.4334 509.9665,356.7784 L509.9655,356.1404 C509.9655,356.0504 509.9985,355.9694 510.0625,355.9054 C510.1265,355.8414 510.2075,355.8084 510.2975,355.8084 L511.8165,355.8084 C511.9995,355.8084 512.1485,355.9574 512.1485,356.1404 L512.1485,365.9034 C512.1485,365.9944 512.1135,366.0764 512.0485,366.1404 C511.9835,366.2044 511.9005,366.2364 511.8095,366.2354 L510.2935,366.2054 C510.1125,366.2024 509.9675,366.0544 509.9675,365.8734 L509.9675,365.2394 Z M475.5545,365.2214 C475.4665,365.3034 475.3765,365.3834 475.2825,365.4584 C474.7585,365.8804 474.1665,366.1274 473.5155,366.2814 C472.0275,366.6324 470.4465,366.3774 469.1655,365.5334 C467.6315,364.5214 466.8125,362.8694 466.8015,361.0454 C466.7905,359.1054 467.6635,357.3964 469.3485,356.3984 C470.7975,355.5404 472.6525,355.3524 474.2245,355.9784 C474.7075,356.1714 475.1585,356.4394 475.5535,356.7784 L475.5525,356.1404 C475.5525,356.0504 475.5855,355.9694 475.6495,355.9054 C475.7135,355.8414 475.7945,355.8084 475.8845,355.8084 L477.4025,355.8084 C477.5855,355.8084 477.7345,355.9574 477.7345,356.1404 L477.7345,365.9034 C477.7345,365.9944 477.7005,366.0764 477.6355,366.1404 C477.5705,366.2044 477.4875,366.2364 477.3965,366.2354 L475.8805,366.2054 C475.6995,366.2024 475.5545,366.0544 475.5545,365.8734 L475.5545,365.2214 Z M482.7085,356.8114 C483.2945,356.2874 483.9055,355.9724 484.6735,355.7814 C486.2245,355.3944 487.8795,355.6614 489.1995,356.5714 C490.6935,357.6014 491.4725,359.2454 491.4625,361.0454 C491.4515,362.9564 490.5525,364.6724 488.9015,365.6624 C487.6285,366.4254 486.0875,366.6324 484.6545,366.2584 C483.9955,366.0854 483.3845,365.8104 482.8605,365.3694 C482.8085,365.3254 482.7585,365.2804 482.7085,365.2344 L482.7085,369.8914 C482.7085,369.9814 482.6745,370.0624 482.6105,370.1264 C482.5475,370.1904 482.4665,370.2234 482.3755,370.2234 L480.8595,370.2214 C480.6765,370.2204 480.5275,370.0714 480.5285,369.8884 L480.5505,356.1384 C480.5515,355.9554 480.7005,355.8064 480.8825,355.8064 L482.3695,355.8074 C482.5505,355.8074 482.6985,355.9534 482.7015,356.1354 L482.7085,356.8114 Z M517.1295,356.8044 C517.7135,356.2844 518.3215,355.9724 519.0875,355.7814 C520.6375,355.3944 522.2935,355.6614 523.6135,356.5714 C525.1065,357.6014 525.8865,359.2454 525.8755,361.0454 C525.8645,362.9564 524.9655,364.6724 523.3145,365.6624 C522.0425,366.4254 520.5005,366.6324 519.0675,366.2584 C518.2705,366.0504 517.7385,365.7554 517.1215,365.2384 L517.1215,365.9064 C517.1215,365.9964 517.0885,366.0774 517.0245,366.1414 C516.9605,366.2054 516.8795,366.2384 516.7895,366.2384 L515.2735,366.2364 C515.0905,366.2364 514.9415,366.0864 514.9415,365.9034 L514.9575,351.9534 C514.9575,351.7704 515.1065,351.6214 515.2895,351.6214 L516.7885,351.6224 C516.9705,351.6224 517.1195,351.7704 517.1195,351.9534 L517.1295,356.8044 Z M462.4625,362.3504 L462.4625,362.3454 L462.4635,359.6034 C462.4635,359.5124 462.4665,359.4214 462.4645,359.3314 C462.4645,359.3114 462.4645,359.2754 462.4585,359.2574 C462.4455,359.2164 462.3625,359.1154 462.3345,359.0784 C462.0745,358.7364 461.8035,358.5034 461.4505,358.2634 C460.6905,357.7474 459.6665,357.5874 458.7675,357.7164 C458.0225,357.8234 457.3105,358.1264 456.7775,358.6684 C456.0455,359.4114 455.8215,360.4364 455.9305,361.4504 C456.0075,362.1704 456.2755,362.8474 456.7825,363.3744 C457.5315,364.1534 458.6065,364.4094 459.6575,364.3434 C460.4965,364.2914 461.3845,363.9704 461.9695,363.3494 C462.0515,363.2624 462.1385,363.1814 462.2245,363.0994 C462.2715,363.0544 462.3235,363.0064 462.3615,362.9534 C462.4675,362.8084 462.4645,362.5234 462.4625,362.3504 Z M449.3695,362.3504 L449.3695,362.3454 L449.3705,359.6034 C449.3705,359.5124 449.3735,359.4214 449.3715,359.3314 C449.3705,359.3114 449.3705,359.2754 449.3645,359.2564 C449.3515,359.2164 449.2695,359.1154 449.2415,359.0784 C449.0475,358.8234 448.8175,358.5954 448.5615,358.4034 C447.7325,357.7834 446.6905,357.5704 445.6745,357.7164 C444.9285,357.8234 444.2175,358.1264 443.6845,358.6684 C442.9515,359.4114 442.7285,360.4364 442.8365,361.4504 C442.9515,362.5224 443.4645,363.4104 444.4285,363.9274 C444.8805,364.1694 445.3865,364.3054 445.8965,364.3464 C446.9335,364.4304 448.1455,364.1254 448.8765,363.3494 C448.9585,363.2624 449.0445,363.1814 449.1315,363.0994 C449.1785,363.0544 449.2295,363.0064 449.2685,362.9534 C449.3745,362.8084 449.3705,362.5234 449.3695,362.3504 Z M506.2745,357.7164 C505.5295,357.8234 504.8175,358.1264 504.2845,358.6684 C503.5525,359.4114 503.3285,360.4364 503.4375,361.4504 C503.5515,362.5224 504.0655,363.4104 505.0285,363.9274 C505.4805,364.1694 505.9875,364.3054 506.4965,364.3464 C507.7165,364.4454 509.1275,363.9704 509.8685,362.9534 C509.9745,362.8084 509.9715,362.5224 509.9695,362.3454 L509.9705,359.6034 C509.9705,359.5124 509.9735,359.4214 509.9715,359.3314 C509.9715,359.3114 509.9715,359.2754 509.9655,359.2574 C509.9525,359.2154 509.8695,359.1154 509.8415,359.0784 C509.6475,358.8234 509.4185,358.5954 509.1615,358.4034 C508.3325,357.7834 507.2905,357.5704 506.2745,357.7164 Z M471.8615,357.7164 C471.1155,357.8234 470.4045,358.1264 469.8705,358.6684 C469.1385,359.4114 468.9155,360.4364 469.0235,361.4504 C469.1005,362.1704 469.3695,362.8474 469.8765,363.3744 C470.6255,364.1534 471.6995,364.4094 472.7505,364.3434 C473.5895,364.2914 474.4775,363.9704 475.0635,363.3494 C475.1455,363.2624 475.2315,363.1814 475.3185,363.0994 C475.3655,363.0544 475.4165,363.0064 475.4555,362.9534 C475.5615,362.8084 475.5575,362.5224 475.5565,362.3454 L475.5575,359.6034 C475.5575,359.5124 475.5605,359.4214 475.5585,359.3314 C475.5575,359.3114 475.5575,359.2754 475.5515,359.2574 C475.5385,359.2164 475.4565,359.1154 475.4285,359.0784 C475.1685,358.7364 474.8975,358.5034 474.5445,358.2634 C473.7845,357.7474 472.7595,357.5874 471.8615,357.7164 Z M485.2845,357.7094 C484.6815,357.7994 484.1355,357.9574 483.6385,358.3244 C483.4275,358.4794 483.2375,358.6614 483.0545,358.8494 C482.9765,358.9294 482.7675,359.1244 482.7285,359.2204 C482.7085,359.2704 482.7065,359.3514 482.7055,359.4044 C482.7015,359.5854 482.7075,359.7664 482.7085,359.9474 C482.7095,360.5634 482.7085,361.1804 482.7085,361.7974 C482.7085,362.0724 482.6765,362.3734 482.7225,362.6454 C482.7555,362.8474 482.8375,363.0064 482.9685,363.1634 C483.1955,363.4354 483.5365,363.6614 483.8385,363.8434 C484.6495,364.3294 485.7125,364.4534 486.6335,364.2854 C487.7155,364.0884 488.5735,363.4584 489.0025,362.4354 C489.2395,361.8694 489.3175,361.2414 489.2495,360.6334 C489.1955,360.1484 489.0485,359.6724 488.8085,359.2474 C488.4985,358.7004 488.0485,358.2604 487.4815,357.9844 C486.7975,357.6514 486.0285,357.5984 485.2845,357.7094 Z M519.6975,357.7094 C519.0945,357.7994 518.5485,357.9574 518.0525,358.3244 C517.8415,358.4794 517.6505,358.6614 517.4685,358.8494 C517.3905,358.9294 517.1805,359.1244 517.1415,359.2204 C517.1215,359.2704 517.1205,359.3514 517.1185,359.4044 C517.1145,359.5854 517.1215,359.7664 517.1215,359.9474 C517.1225,360.5634 517.1215,361.1804 517.1215,361.7974 C517.1215,362.0724 517.0905,362.3734 517.1355,362.6454 C517.1695,362.8474 517.2505,363.0064 517.3815,363.1634 C517.6095,363.4354 517.9495,363.6614 518.2515,363.8434 C519.0625,364.3294 520.1255,364.4534 521.0465,364.2854 C522.1285,364.0884 522.9865,363.4584 523.4155,362.4354 C523.6525,361.8694 523.7305,361.2414 523.6635,360.6334 C523.6095,360.1484 523.4615,359.6724 523.2215,359.2474 C522.9115,358.7004 522.4615,358.2604 521.8945,357.9844 C521.2105,357.6514 520.4415,357.5984 519.6975,357.7094 Z" id="Combined-Shape" stroke="none"  fill-rule="evenodd"></path>
                        </svg>
                    </Link>);
        const links = (<nav className="links">
            <ul>
                <li><Link data-animate-line="3" onClick={this.handleClick} to={routePaths.client.about}>{'About'}</Link></li>
                <li><Link data-animate-line="4" onClick={this.handleClick} to={routePaths.client.expertise}>{'Expertise'}</Link></li>
                <li><Link data-animate-line="5" onClick={this.handleClick} to={routePaths.client.portfolio}>{'Portfolio'}</Link></li>
                <li><Link data-animate-line="6" onClick={this.handleClick} to={routePaths.client.careers}>{'Careers'}</Link></li>
                <li><Link data-animate-line="7" onClick={this.openContact} to={routePaths.client.contact}>{'Contact'}</Link></li>
            </ul>
        </nav>);
        const contact = (<div className="contact-container">
            <div className="contact left">
                <div className="content">
                    <p>Everything changes but our passion!</p>
                    <p>Come and join the <Link data-animate-line="3" onClick={this.handleClick} to={routePaths.client.about} >{'family'}</Link>.</p>
                </div>
            </div>
            <div className="contact right">
                <ul className="content">
                    <li>Str. John doe, Nr. 2. Iasi, 123456, Romania</li>
                    <li>+40123 456 789</li>
                    <li><a href="mailto:contact@adaptabi.com">contact@adaptabi.com</a></li>
                    <li className="social-media">
                        <a target="_blank" href="http://linkedin.com"><i className="ncs-linkedin-square" /></a>
                        <a target="_blank" href="http://facebook.com"><i className="ncs-facebook-square" /></a>
                        <a target="_blank" href="http://twitter.com"><i className="ncs-twitter" /></a>
                        <a target="_blank" href="http://plus.google.com"><i className="ncs-google-plus" /></a>
                    </li>
                </ul>
            </div>
            <div className="contact btn">
                <div className="content">
                    <i className="ncs-chevron-with-circle-left" onClick={this.closeContact} />
                </div>
            </div>
        </div>);
        if (this.props.linksOnly) {
            return (
                <header className="main" ref="header">
                    {logo}
                    {links}       
                    <Burger onClick={this.burgerClick} />
                    {contact}                                 
                </header>
            );
        } else {
            return (
                <header className="main" ref="header">
                    <div className="image"><div className="img" /></div>
                    <div className="gradient" />
                    {logo}
                    {links}      
                    <div className="text"><h1>{this.props.title}</h1></div>
                    <Burger onClick={this.burgerClick} />    
                    {contact}      
                </header>
            );
        }
    }
}

Header.propTypes = {
    linksOnly: PropTypes.bool,
    strings: PropTypes.object.isRequired,
    title: PropTypes.string,
    transition: PropTypes.func.isRequired,
};

Header.defaultProps = {
    strings: {
    },
};

export default Header;