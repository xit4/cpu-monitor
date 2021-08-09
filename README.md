# About the project

This is a browser-based CPU load monitoring application that displays 10 minutes of load history in the shape of a linechart. The application also alerts the user (and keeps track of the alert count) of prolonged (2 minutes) high loads and also recoveries from these states.

## TL;DR How to setup and start the app

To install the dependencies run **`yarn`** \
and to run the app run **`yarn serve`** \
The last command will serve both the FE and BE on port 4242\
It is also possible to run the app in development mode by running `yarn start` but hot realoading will work only on the frontend code

In order to simulate CPU load I used the following command multiple times until the CPU avg load reached the numbers I wanted.

`yes > /dev/null &`

do not forget to `killall yes` when you are done

## Available Scripts
In the project directory, you can run:

### `yarn serve`

Serves the entire project (server and UI) in a single express app\
reachable at [http://localhost:4242](http://localhost:4242)

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches both UI and server tests

### `yarn test:frontend`

Launches UI tests in interactive mode

### `yarn test:backend`

Launches server tests.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

## What and why

I approached this assignment with a "try-new-things" mentality, but at the same time I also chose comfortable tools. I decided I would work on the CPU monitor as if I was building a single "card" that could be used on its own, next to other "cards" representing other values that need monitoring. \
Due to the limited size of the project, I decided to not take advantage of any state management tool (Redux, Context, etc.) and handle polling, alerts and their side effects with the observable pattern. In hindsight, I would not make this choice again, but it certainly helped me familiarize with a pattern I do not get to use (hands-on) in my daily work that often. \
For the same reason, I did not use SCSS (or any equivalent solution) or styled-components to style my components. There were not many classes and most of them did not collide. This results in longer classnames and overall messier code but gave me a nostalgic kick back to when CSS preprocessors were not a thing. \
I could have chosen many ways to show the load history, but I went with a line chart to force myself into using D3 that, again, I do not get the chance to use **directly** in my day to day.

### Tech stack, libraries, tools and patterns
- **create-react-app** to bootstrap the project
- **React**
- **Typescript**
- **d3**, it was the first time using it hands on since I usually get to uset it through other charting libraries
- **Express/NodeJS** for the simple backend and to serve the app
- **git** to version code (private repo on Github)



## Future improvements

_"Please write up a small explanation of how you would extend or improve your application design if you were building this for production."_

As mentioned in the previous section, I would move the state/side effect management away from observables since it does not add much more than a simple context+reducer solution but loses much of the dev tools support for debugging. \
As the project grows, the need for a CSS preprocessor would become more and more prominent and, of course, the necessity for a proper light/dark theme too.\
For a single client single server solution, polling might work ok, but in case "production" means increasing the amount of clients by a lot, then it probably would be safer to use a more passive approach: subscribing to load changes and moving some logic over to the server.\
Right now the project is served (both FE and BE) by a single express app, and this works great to get simple applications to production but, depending on how we implement routing (say we want to add a link to have load averages for each CPU separately "/1" for CPU1, "/2" for CPU2, etc.) it might be safer and cleaner to split the two into subprojects and deploy them separately.\
Feature wise I would definitely add some sort of "custom settings" functionality to allow the choice of all the constants (refresh_rate, threshold, etc.) to the user, that would greatly improve the usefulness of the application. Since one of the main features of the app is notifying the user in case of high loads or recoveries, I would take advantage of the browser Notification API to send desktop notifications informing the user of the current CPU status. 


## Known issues

- The backend will probably not work on a Windows machine (as mentioned in the assignment) but installin a polyfil would fix this issue (e.g. `loadavg-windows`)
- Hibernation/sleep policies on laptops and especially phones, causing the browser tabs to lose CPU time when not focused, do not play well with polling and result in weird distances between points of the graph due to d3 handling the x-axis as a time axis. A more direct handling of the axis ticks might be required, or even a laxer history size limit.
