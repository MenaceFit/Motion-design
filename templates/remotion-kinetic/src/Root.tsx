import React from 'react';
import {Composition} from 'remotion';
import {KineticWords, kineticSchemaDefaults, durationFromWords} from './KineticWords';
import {LineStory, lineStoryDefaults} from './LineStory';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Style A : "Neon Word Pop" (famille ref01/ref02) — 1 mot à l'écran, synchro voix */}
    <Composition
      id="KineticWords"
      component={KineticWords}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={durationFromWords(kineticSchemaDefaults.words, 30)}
      defaultProps={kineticSchemaDefaults}
      calculateMetadata={({props}) => ({durationInFrames: durationFromWords(props.words, 30)})}
    />
    {/* Style B : "Minimal Line" (famille ref04/ref05) — line art blanc + sous-titres mot à mot */}
    <Composition
      id="LineStory"
      component={LineStory}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={150}
      defaultProps={lineStoryDefaults}
    />
  </>
);
