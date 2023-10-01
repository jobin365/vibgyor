import "./Grid.css";
import Block from "./Block.js";
import { useSprings } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useEffect, useRef } from "react";

export default function Grid(props) {
  const colors = [
    "violet",
    "indigo",
    "blue",
    "green",
    "yellow",
    "orange",
    "red",
  ];

  function checkIfSorted(array) {
    let sorted = true;
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] > array[i + 1]) {
        sorted = false;
        break;
      }
    }
    return sorted;
  }

  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  const blockInRow = props.blocksInRow;

  const immediateMotionsProsp = {
    x: true,
    y: true,
  };

  const getBlockCoordinates = (index) => {
    const col = Math.floor(index % blockInRow);
    const row = Math.floor(index / blockInRow);
    return { x: col * 50 + col * 15, y: 50 * row + row * 15 , scale: 1, zIndex : 1};
  };

  const totalBlocks = props.noOfBlocks;

  const noOfRows =
    totalBlocks % blockInRow === 0
      ? totalBlocks / blockInRow
      : Math.round(totalBlocks / blockInRow) + 1;

  //Stores the order of blocks, index is order, value identifies the block
  const blocks = useRef(
    shuffle(new Array(totalBlocks).fill(0).map((_, i) => i))
  );

  //Stores standard coordinates for all positions
  const initialCoordinates = useRef(
    blocks.current.map((b, i) => getBlockCoordinates(i))
  );
  //Stores the standard initial coordinate of the block being dragged
  const movingBlockInitialCoordinates = useRef(null);
  //Stores new position coordinates as position updates
  const newPositionCoordinates = useRef({ x: 0, y: 0 });
  const oldPositionSave = useRef(null);

  function handleMouseOver(event) {
    let id = event.currentTarget.getAttribute("bid");
    let position = blocks.current.indexOf(parseInt(id));
    //Old position means the position from which the dragging started
    oldPositionSave.current = position;
    movingBlockInitialCoordinates.current =
      initialCoordinates.current[position];
    //When dragging is about to start, we want newPositionCoordinates to be same as the current coordinates.
    newPositionCoordinates.current.x = movingBlockInitialCoordinates.current.x;
    newPositionCoordinates.current.y = movingBlockInitialCoordinates.current.y;
  }
  console.log('RENDER')

  function handleMouseUp(event) {
    //We are doing the exact same thing as handleMouseOver here, because a user can drag same block after releasing it. When doing so onMouseOver doesn't get called.
    //One extra thing we do here is we check if the order of blocks is correct. If it is, then we display the Success Kid image.
    let id = event.currentTarget.getAttribute("bid");
    let position = blocks.current.indexOf(parseInt(id));
    //Old position means the position from which the dragging started
    oldPositionSave.current = position;
    movingBlockInitialCoordinates.current =
      initialCoordinates.current[position];
    //When dragging is about to start, we want newPositionCoordinates to be same as the current coordinates.
    newPositionCoordinates.current.x = movingBlockInitialCoordinates.current.x;
    newPositionCoordinates.current.y = movingBlockInitialCoordinates.current.y;
    props.setVibgyor(checkIfSorted(blocks.current));
  }

  const [springs, api] = useSprings(totalBlocks, (index) =>
    getBlockCoordinates(index)
  );

  useEffect(() => {
    api.start((index) => {
      const blockIndex = blocks.current.indexOf(index);
      const blockCoordinate = initialCoordinates.current[blockIndex];
      return {
        x: blockCoordinate.x,
        y: blockCoordinate.y,
      };
    });
  }, []);

  const bind = useDrag(
    ({ args: [draggingBlockIndex], down, movement: [mx, my] }) => {
      api.start((index) => {
        // We are only calculating new positions for the block that is being dragged
        if (down && index === draggingBlockIndex) {
          const oldPosition = blocks.current.indexOf(draggingBlockIndex);
          //The formula between paranthesis calculates how much the block has been moved from it's current position. The formula also works if position gets updated.
          let y = Math.round(
            (initialCoordinates.current[oldPositionSave.current].y +
              my -
              newPositionCoordinates.current.y) /
              60
          );
          if (Math.abs(y) > 0.5) {
            y = y * blockInRow;
          }
          const x = Math.round(
            (initialCoordinates.current[oldPositionSave.current].x +
              mx -
              newPositionCoordinates.current.x) /
              60
          );

          let newPosition = y + x + oldPosition;
          if (newPosition !== oldPosition) {
            //The user can drag blocks to coordinates that are far away
            if (newPosition < 0) {
              newPosition = 0;
            }
            if (newPosition > totalBlocks - 1) {
              newPosition = totalBlocks - 1;
            }
            
            newPositionCoordinates.current.x =
              initialCoordinates.current[newPosition].x;
            newPositionCoordinates.current.y =
              initialCoordinates.current[newPosition].y;

            let newOrder = [...blocks.current];
            // swaping
            const [toBeMoved] = newOrder.splice(oldPosition, 1);
            newOrder.splice(newPosition, 0, toBeMoved);
            blocks.current = newOrder;
          }
        }

        const blockIndex = blocks.current.indexOf(index);
        const blockCoordinate = initialCoordinates.current[blockIndex];

        return {
          x:
            down && index === draggingBlockIndex
              ? movingBlockInitialCoordinates.current.x + mx
              : blockCoordinate.x,
          y:
            down && index === draggingBlockIndex
              ? movingBlockInitialCoordinates.current.y + my
              : blockCoordinate.y,
          scale: down && index === draggingBlockIndex ? 1.2 : 1,
          zIndex: down && index === draggingBlockIndex ? 10 : 1,
          immediate:
            down && draggingBlockIndex === index
              ? (n) => immediateMotionsProsp[n]
              : undefined,
        };
      });
    }
  );

  return (
    <div
      className="grid"
      style={{
        width: `${blockInRow * 65 - 5}px`,
        height: `${noOfRows * 65 - 5}px`,
      }}
    >
      {blocks.current.map((index) => (
        <Block
          color={colors[index]}
          key={index}
          spring={springs[index]}
          bind={bind}
          index={index}
          onMouseOver={handleMouseOver}
          onMouseUp={handleMouseUp}
        />
      ))}
    </div>
  );
}
