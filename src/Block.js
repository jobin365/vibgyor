import "./Block.css";
import { animated } from "@react-spring/web";

export default function Block(props) {
  return (
    <animated.div
      {...props.bind(props.index)}
      className="block"
      style={{
        ...props.spring,
        backgroundColor:props.color
      }}
      bid={props.index}
      onMouseOver={props.onMouseOver}
      onMouseUp={props.onMouseUp}
      onTouchEnd={props.onTouchEnd}
      />
  );
}
