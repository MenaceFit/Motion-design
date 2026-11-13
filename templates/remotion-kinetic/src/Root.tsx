import React from 'react';
import {Composition} from 'remotion';
import {KineticWords, kineticSchemaDefaults, durationFromWords} from './KineticWords';
import {LineStory, lineStoryDefaults} from './LineStory';
import {Text3D, text3DDefaults, durationFrom3DWords} from './Text3D';
import {Gallery3D} from './Gallery3D';
import {RigTest} from './teddy/RigTest';
import {TeddyEpisode, episodeDefaults} from './teddy/Episode';
import {TeddyEpisodeFull} from './teddy/EpisodeFull';
import {TeddyEpisode2} from './teddy/Episode2';
import {ProfilePic, profilePicDefaults} from './teddy/ProfilePic';
import {TeddyEpisode3} from './teddy/Episode3';
import {PirateToken, pirateDefaults} from './PirateToken';

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
    {/* Texte 3D extrudé (Three.js) — 60 fps pour la fluidité */}
    <Composition
      id="Text3D"
      component={Text3D}
      width={1080}
      height={1920}
      fps={60}
      durationInFrames={durationFrom3DWords(text3DDefaults.words, 60)}
      defaultProps={text3DDefaults}
      calculateMetadata={({props}) => ({durationInFrames: durationFrom3DWords(props.words, 60, props.captions)})}
    />
    {/* Même composition en 30 fps : aperçus rapides (rendu ~2x plus court) */}
    <Composition
      id="Text3D30"
      component={Text3D}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={durationFrom3DWords(text3DDefaults.words, 30)}
      defaultProps={text3DDefaults}
      calculateMetadata={({props}) => ({durationInFrames: durationFrom3DWords(props.words, 30, props.captions)})}
    />
    {/* TikTok 10 s « Jeton de la Boutique Pirate » : habillage motion autour des captures de jeu */}
    <Composition id="PirateToken" component={PirateToken} width={1080} height={1920} fps={60} durationInFrames={600} defaultProps={pirateDefaults} />
    <Composition id="Gallery3D" component={Gallery3D} width={1080} height={1920} fps={30} durationInFrames={60} />
    <Composition id="TeddyProfilePic" component={ProfilePic} width={1080} height={1080} fps={30} durationInFrames={1} defaultProps={profilePicDefaults} />
    <Composition id="TeddyRigTest" component={RigTest} width={1080} height={1920} fps={30} durationInFrames={30} />
    <Composition id="TeddyEp" component={TeddyEpisode} width={1080} height={1920} fps={60} durationInFrames={900}
      defaultProps={episodeDefaults} calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.duration * 60)})} />
    <Composition id="TeddyEpFull" component={TeddyEpisodeFull} width={1080} height={1920} fps={60} durationInFrames={3600}
      defaultProps={episodeDefaults} calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.duration * 60)})} />
    <Composition id="TeddyEp02" component={TeddyEpisode2} width={1080} height={1920} fps={60} durationInFrames={3600}
      defaultProps={episodeDefaults} calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.duration * 60)})} />
    <Composition id="TeddyEp03" component={TeddyEpisode3} width={1080} height={1920} fps={60} durationInFrames={3600}
      defaultProps={episodeDefaults} calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.duration * 60)})} />
  </>
);
