import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
// Dans le conteneur cloud : utiliser le Chromium préinstallé
if (process.env.CHROMIUM_PATH) Config.setBrowserExecutable(process.env.CHROMIUM_PATH);
