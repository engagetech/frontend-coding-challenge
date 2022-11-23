# Engage - Frontend Coding Challenge

Occasionally we get to speak with wonderful engineers that would be a great addition to our super nice team. When this happens, we want to give them the chance to show what they can do, so we share this challenge with them.

This challenge should allow you to show off your Angular (version 13 or later) and HTML/CSS abilities. Inside the `design` folder there are 4 images which represent the various states of the table we would like you to build.

* One of the images shows the initial default view of the dataset, with the totals at the bottom of the table, Direct Contractors at the top, and the list of providers sorted alphabetically between them.
* The remaining three images show how the table is represented when sorting by other criteria.

You will need to create an Angular application that displays the data returned from a REST endpoint provided by the included Node.js application.

Feel free to use any CSS preprocessor and methodology you like. The font family should be `Open Sans`.

We are not looking for extensive browser support, providing it works in recent versions of Chrome and Firefox, that's fine!

## Requirements

* The result should accurately represent the design templates. This is the most important requirement and we will not take your assignment further if it doesn't match the mockups.
* Clicking one the column headers should sort the data from highest to lowest values, or alphabetical as appropriate.
* When sorting by Payroll Provider, Direct Contractors should always appear as the first entry.
* When sorting by any other column, Direct Contractors should appear sorted with the provider entries.

### Extra credits

If you fancy doing a little extra, here are some things that might be nice to add:

* Clicking on the column headers should toggle sorting in forward and backward directions for that column.
* Show the currently sorted column data in a darker colour.
* Adapt the table for small devices.
* Animate the re-ordering of the table rows (you can get creative).

### What we are looking for

We want this to match the mockups, you'd be amazed (or maybe you wouldn't?) the percentage of submissions in the past that do not. A good eye for detail is important to us. And there are some details in the mockup that need a good eye to be spotted.

How you structure and name classes in your stylesheets matters. Is there any methodology, is it scaleable? Can it be re-used for other design patterns? Or are you just hacking things together until they look right?

Things should work as the requirements describe. It's okay to ask questions if you don't understand something, we collaborate regularly with other engineers, designers and product managers and always encourage discussions.

If we like the end result, we will want you to talk us through your code and any decisions you made.

## Running the backend

The backend service can be run from the `backend` directory by following these steps
1. open a terminal from the `backend` directory
2. run `npm ci` to install the required dependencies
3. run `npm run dev` to start the backend service. You should see the following in the console ``` Server listening on port 6502 ```.

This should expose an endpoint on `http://localhost:6502/application`

## Sending us the result

Once your solution is ready, you can either create a repository and send us the link or simply email us a zip file containing all the necessary files.

If for whatever reason you need more time to finish the challenge, please let us know. We prefer you to take your time and have a shiny result rather than sending it half-baked.
