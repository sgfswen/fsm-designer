import * as React from "react";
import * as ReactDOM from "react-dom";
import {linkState} from "./helpers";
import {autobind} from "core-decorators";
import StatesView from "./StatesView";
import Victor = require("victor");
import ArrowView from "./ArrowView";
import ArrowsView from "./ArrowsView";

const arrowLength = 10;

interface Props{
    startState: State,
    states: State[],
    containerOffset: Coord,
    onMouseMove: (newState: State | null) => any,
    onFinish: () => any
}

function v(vec: {x: number, y: number}){
    return Victor.fromObject(vec);
}

export default class ProposedArrow extends React.Component<Props, /*state*/{
    mousePosition: Coord | null
}>{
    constructor(props: Props){
        super(props);

        this.state = {
            mousePosition: null
        }

        document.body.addEventListener("mousemove", this.handleMouseMove);
        document.body.addEventListener("mouseup", this.handleMouseUp);
    }

    componentWillUnmount(){
        document.body.removeEventListener("mousemove", this.handleMouseMove);
        document.body.removeEventListener("mouseup", this.handleMouseUp);
    }

    @autobind
    handleMouseUp(){
        this.props.onFinish();
    }

    snappedElement: number | null = null;

    @autobind
    handleMouseMove(ev: MouseEvent){
        this.setState({
            mousePosition: {
                x: ev.clientX - this.props.containerOffset.x,
                y: ev.clientY - this.props.containerOffset.y
            }
        })

        this.snappedElement = this.getSnappedElement();

        if(this.snappedElement === null){
            this.props.onMouseMove(null);
        }
        else{
            this.props.onMouseMove(this.props.states[this.snappedElement]);
        }
    }

    static snapDistance = 40;

    getSnappedElement(): null | number{
       for(var i = 0;i < this.props.states.length;i++){
            var state = this.props.states[i];
            if(v(ArrowsView.getStateCenterPos(state.position))
                        .distance(v(this.state.mousePosition as Coord)) < ProposedArrow.snapDistance){
                return i;
            }
        }

        return null;
    }

    static getStateEdgePosition(mousePosition_: Coord, state: State){
        var mousePosition = Victor.fromObject(mousePosition_);
        var stateCenter = Victor.fromObject(ArrowsView.getStateCenterPos(state.position));
        var dir = mousePosition.clone().subtract(stateCenter).normalize();
    
        var edgePos = stateCenter.clone().add(dir.clone().multiplyScalar(StatesView.wholeStateRadius));

        return edgePos;
    }

    render(){
        if(this.state.mousePosition === null){
            return null;// don't render when the mouse position is not known
        }

        if(this.snappedElement === null){
            return <ArrowView
                    start={ProposedArrow.getStateEdgePosition(
                        this.state.mousePosition, this.props.startState)}
                    end={this.state.mousePosition}/>
        }
        else{
            return null;
        }
    }
}
