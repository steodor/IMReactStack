import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import routePaths from '../../common/routePaths';
import actions, { enableScenes, disableScenes } from '../actions';
import * as animations_generic from './animations/generic';
import * as animations_homepage from './animations/homepage';
import dom from 'react-dom';


let $ = window.$, $body = $('body'), $window = $(window);

let animations = {
    generic: animations_generic,
    homepage: animations_homepage,
};

const stateToProps = state => ({
    transition: state.transition,
    ui: state.ui,
});

const mapDispatchToProps = (dispatch) => {
    return {
		enableScenes: () => {
			dispatch(enableScenes());
		},
        disableScenes: () => {
			dispatch(disableScenes());
		},
        dispatchTransition: (setup) => {
            dispatch(actions.transition(setup));
        },
    };
};

export default (BaseComponent) => {
    BaseComponent.propTypes = {
        enableScenes: PropTypes.func.isRequired,
        transition: PropTypes.object.isRequired,
    };

    BaseComponent = connect(stateToProps, mapDispatchToProps)(BaseComponent);

    class TransitionComponent extends BaseComponent {
        //spread op works only because of plugins in babelrc (on IE10)
        constructor(...args) {
            super(...args);
            this.enableScenes = this.enableScenes.bind(this);
            this.disableScenes = this.disableScenes.bind(this);
            this.cleanTransition = this.cleanTransition.bind(this);
        }
        componentWillAppear(callback) {
            $body.addClass('navigating');
            let animation = 'generic';
            this.props.route.path == routePaths.client.root && (animation = 'homepage');
            this.animation = animations[animation];

            //console.log('componentWillAppear', this);

            this.animation.appear(this.refs.container, this.willEnterCallback.bind(this, callback));
        }
        componentWillEnter(callback) {
            let transition = this._clone.props.transition, ui = this._clone.props.ui;
            
            let animationName = 'generic';
            this.props.route.path == routePaths.client.root && (animationName = 'homepage');
            this.animation = animations[animationName];

            if (!transition || !transition.type) {
                // console.warn('componentWillEnter HAS NO TYPE');
                return this.willEnterCallback(callback);
            }
            // console.log('componentWillEnter', animationName, ui.media.current + '_enter_' + transition.type);

            $body.addClass('navigating');
            if (this.animation[ui.media.current + '_enter_' + transition.type]) {
                this.animation[ui.media.current + '_enter_' + transition.type](this.refs.container, this.willEnterCallback.bind(this, callback), transition, this.enableScenes);
            }
            else {
                console.warn('On enter,', animationName, 'does not have any animation:', ui.media.current + '_enter_' + transition.type);
                return this.willEnterCallback(callback);
            }
        }
        componentWillLeave(callback) {
            let transition = this._clone.props.transition, ui = this._clone.props.ui;
            if (!transition || !transition.type || !this.animation) {
                // console.log('componentWillLeave HAS NO TYPE OR ANIMATION', transition, this.animation);
                return this.willLeaveCallback(callback);
            }
            // console.log('componentWillLeave using function', ui.media.current + '_leave_' + transition.type);

            $body.addClass('navigating');
            if (this.animation[ui.media.current + '_leave_' + transition.type]) {
                let initialScroll = $window.scrollTop();
                this.disableScenes();
                $.scrollLock(true);
                this.animation[ui.media.current + '_leave_' + transition.type](this.refs.container, this.willLeaveCallback.bind(this, callback), transition, initialScroll);
            }
            else {
                console.warn('On leave, does not have any animation: ', ui.media.current + '_leave_' + transition.type);
                return this.willLeaveCallback(callback);
            }

        }
        willEnterCallback(callback) {
            //console.warn('willEnterCallback');
            $body.removeClass('navigating');
            $(dom.findDOMNode(this.refs.container)).removeClass('fix-header contact-open menu-open');
            this.cleanTransition();
            $.scrollLock(false, false);
            setTimeout(this.enableScenes, 100);
            callback();
        }
        willLeaveCallback(callback) {
            //console.warn('willLeaveCallback');
            // $body.removeClass('navigating');
            // $(dom.findDOMNode(this.refs.container)).removeClass('fix-header contact-open menu-open');
            // this.cleanTransition();
            // $.scrollLock(false, false);
            // setTimeout(this.enableScenes, 100);    
            callback();
        }
        render() {
            return (this._clone = React.cloneElement(super.render(), { ref: 'container' }));
        }

        enableScenes() {
            this._clone.props.enableScenes();
        }
        disableScenes() {
            this._clone.props.disableScenes();
        }
        cleanTransition() {
            this._clone.props.dispatchTransition({type: ''});
        }
    }

    return TransitionComponent;
};
