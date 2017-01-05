# DiligentSearchWebsite

This repository holds the Diligentsearch project
The project is based on the 'outofcopyright' project

## Objectives:

Allow a end user to determine the copyrigh status of an orphan work in the European Union

## Data model of application:

The application is splitted between 3 different data models,
 * Primary data model: contains all basic elements, referenced by dedicated ID
 * Graphical Decision Tree model: contains the hierachy of such a process to deterine status of an orphan work
 * Form model: final data model, presented to the end user, which will edit copy all the long he fills in

 These 3 different models come one from an other.
 A change to the first will transfer changes to others.