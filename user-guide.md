# Diligent Search user guide

The proposed application offers to create, edit, and update data allowing the creation of a decision process.

The decision process, once saved into the database, becomes available to users, who can fill in dynamic forms corresponding to computations within the decision process.

This guide objective is to allow user to create such decision processes, and fill in them afterwards.

## Decision process creation

To access the decision process creation, you need to visit the /editor page.
This page is vertically split.

1. Left part : data creation panel
2. Right part : decision process creation panel

> In order to display entirely decision process creation panel, you need to choose a country, and then a type of work.

### Data creation panel

Data are the most important thing of the application, allowing you to create decision process. It's the basement of the whole application.

Data is organized following this order :

	Country > Work > Data

This means that a country, or a jurisdiction, contains types of work, which contains specific data.

> You can check where you stand within this organization by looking at the light grey bar located at the top of the left panel.

You can create as many countries as you want, as many works as you want for a given country, and as much specific data you want.

Those specific data will be used to create a decision process for the selected work within the selected jurisdiction.


#### Create and select a country

To create a jurisdiction, click on the **add a country** button. A pop-up will show up, fill in the information you want and confirm.

To select a country, simply click on it. The breadcrumb (the light grey bar located at the top of the left panel) will evolved accordingly to the choice you've made.

#### Create and select a type of work

To create a type of work, click on the **add a type of work**. A pop-up will show up, fill in the information you want and confirm.

> To get the **add a type of work** button displayed, you need to have selected a country.

To select a type of work, simply click on it. The breadcrumb will display the jurisdiction you chose and the selected type of work.

#### Create specific data

You can create multiple types of data, corresponding to different use cases. Here they are :

1. **User inputs** : allow specific computation in numerical questions based on the content given by user
2. **Reference** values : use those data to store some references to use in numerical computations
3. **Results** : data displaying a final step of a decision process, the result
4. **Questions** : data referencing specific questions
5. **Blocks** : data regrouping a bunch of questions

To create a specific data, click on the dedicated add button. A pop-up will show up, asking for specific information.

##### Pop-up basic structure

Each pop-up will ask for an identifier and further information. 

The identifier is used inside the data editor. We suggest that you use short names to identify your data.

The further information box is useful to provide end users some information on what they have to type inside the form. You can put URL inside this input.

Each time you click on the **save changes** button, your data is saved.


##### Pop-up for question data creation

Question data is the key point of the decision process, as end-user will answer it in the dynamic form rendered afterwards.

You can specify the question that user will see in the **question to ask** field.

You can choose the type of question it will be : free text, check-box, list of predefined choices, or a numeric computation.

The last part of the pop-up presents the output(s) of the created question. Outputs are used within the creation of the decision tree. An output defines a way to the next step of the decision process.

> **Numeric question** case, you will see a specific interface, asking for a reference, a condition type, and inputs. Both reference and inputs are fields providing **autocomplete**, giving references to the user inputs and reference values you have created before.

> **Block question** case, you can refer to predefined question by clicking on the question field. You can also add and remove question fields by cliking the - and + buttons.

##### Specific data deletion

You can delete the data you have created by clicking on it, and select the **delete** button of the pop-up showing up.


### Decision process creation panel

> This panel is available if you have selected a country and a type of work you want to work in.

The current decision process corresponding to the type of work for the given jurisdiction is displayed on the right side of the screen.

If it doesn't exist inside the database, an empty node is created, asking you to click to edit. 
Else, the last decision tree is loaded from the database.

#### Edit the decision process

To edit you decision process, you need to edit each nodes. 

By clicking on a node, a pop-up shows up asking you to select the type of data you want in. It can be a question, a block of question, or a result.

Once the category is selected, you can choose the relative data you want by selecting the corresponding identifier.

Once the data is selected, the output panel is visible, allowing you to configure graphical outputs.

> The output panel is not visible if the selected data is a result.

> The output is associated to a message, that is set within the data definition, in the data creation panel.

##### Node connection

You can choose to connect to a new node, or to an existing one.

In the first case, a new node will be created.

In the second case, you will see the current node connects to the selected node.

> In case of a node connection, you cannot create loops within the decision process, so you cannot connect to a parent node.


> **WARNING** : if you disconnect a node manually, the child node connected before will be deleted if it has no other parent.


##### Node deletion

You can delete a graphic node, by clicking on it and selecting the **delete** button displayed at the bottom of the pop-up.

> **WARNING** : if you delete a node, all its children will be removed, **unless** they have an other parent.

### Save the decision process

You can save your decision process anytime, by clicking the **Save decision process** button, at the top of the Decision process creation panel.

Your decision process will be available for further manipulations, and for end users, who wants to fill in specific forms.

> **WARNING** : An unsaved decision process cannot lead to the rendering of a dynamic form. So you need to save it almost once, to make it available for end users.



## Fill in forms

To access the form rendering process, you need to visit the /search page.
This page display a menu, offering you to start a new research, or to load an old one.

### Start a new research

You will be asked to choose the language you want to work with. Then the jurisdiction you want to work in.
Finally, select the type of work corresponding to the research you're making.

Questions will show up, asking your input before going to the next, until the end of the decision process, and the display of a result.

#### Change already given inputs

You can change the input given before, by clicking on the value. A pop up warning you will shows-up, asking what you want to make.

#### Access the further information

Questions can present some additional information. In such cases, a **more info** clickable label is displayed.

By clicking on it, a pop up shows up, giving you indications for the associated question.

#### Get a pdf

You can print a pdf of your work, by clicking the **get pdf** button. This button will open up a new window presenting a download modal.

> According to your browser settings, it can be a new tab instead of a new window.

The downloaded file is a pdf, representing the content of your research.

#### Save your work

You can save your work, in order to realod it later.

To save it, click on the **Save** button.

> If it has never been saved before, a reference is provided, altering the form heading title.
This reference is used to access this work.


### Load a research

If you possess the research reference of your work, you can load it directly from the man menu of the /search page.

Simply enter the research id within the corresponding field, and click on **continue**.

> If the research id doesn't match anything, a notification is provided.
Else, the work will be laoded in its last state

#### Load a read only previous version

By providing a version number in addition to the research id, you will access to an archived version of your work.

The displayed result cannot be modified, nor saved within the database. The objective is to track the evolution of such researches.

#### Load by URL

You can access the last version of a work by typing the following url : 

	/search?hook=<your_research_ref>

You can also access an archived version of this work, by typing in this url :

	/search?hook=<your_research_ref>&version=<the_version>