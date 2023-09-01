//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { Long } = require("mongodb");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const mongoConnection = async()=>{
  try {

 await   mongoose.connect("mongodb+srv://ghorpadeanuj56:ghorpadeanuj56@cluster0.bjakddt.mongodb.net/todolistDb",{useNewUrlParser: true});

 console.log("Connected succesfully");
    
  } catch (error) {
    console.log("error while connection to mongo cluster :",error);
  }

}
mongoConnection()





  const itemsSchema = {
    name:String
    };
    
    const Item = mongoose.model("Item",itemsSchema);
    
    const item1 = new Item ({
      name:"Welcome to your todolist!"
    });
    
    const item2 = new Item ({
      name:"Hit the + button to aff a new item."
    });
    
    const item3 = new Item ({
      name:"<-- Hit this to delete an item."
    });
    
    const defaultItems = [item1, item2, item3];

    const listSchema = {
      name:String,
      items:[itemsSchema]
    };

    const List = mongoose.model("List", listSchema);
    
    // Item.insertMany(defaultItems).then(console.log("successfully saved default items to DB!"))

    app.get("/", async(req, res) =>{
    
    const items = await Item.find()
    if(items.length===0){
       Item.insertMany(defaultItems).then(console.log("successfully saved default items to DB!"));
       res.redirect("/");
    }else{
      res.render("list",{listTitle:"Today",newListItems:items})
    }
    //  console.log(items);

    //  res.render("list",{listTitle:"Today",newListItems:items})
     
    });

    app.get("/:customListName", async (req, res) =>{
      const customListName = _.capitalize (req.params.customListName);
    
      try {
        const foundList = await List.findOne({ name: customListName }).exec();
        if (!foundList) {
          const list = new List({
            name: customListName,
            items: defaultItems,
          });
          await list.save();
          res.redirect("/" + customListName )
        } else {
         res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
        }
      }catch (err) {
        console.error(err);
      }
    // });
    
      // const list = new List({
      //   name: customListName,
      //   items: defaultItems,
      // });
      // list.save();
    });
    

    app.post("/",function(req, res) {

      const itemName = req.body.newItem;
      const listName = req.body.list;

      const item = new Item({
       name:itemName
      });

      if(listName === "Today") {
       item.save();
      res.redirect("/")
      }else{
        try {
        List.findOne({name: listName}, async function(err, foundList){
          foundList.items.push(item);
          await foundList.save();
          res.redirect("/" + listName);
        });
      
      }catch(err){
        console.error(err);
      }
    }
    });

    app.post("/delete", async (req, res) => {
      const checkedItemId = req.body.checkbox;
      const listName = req.body.listName;
    
      try {
        if (listName === "Today") {
          await Item.findByIdAndRemove(checkedItemId);
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        } else {
          await List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: checkedItemId } } }
          ).exec((err, foundList) => {
            if (!err) {
              res.redirect("/" + listName);
            }
          });
        }
      } catch (err) {
        console.error(err);
      }
    });
         
    
    
   
  

    //   Item.findByIdAndRemove(checkedItemId).then(console.log("Successfully deleted checked item."));
    //   res.redirect("/");
    // });
    

// app.post("/", function(req, res){

//   const item = req.body.newItem;

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
// });

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000||process.env.PORT, function() {
  console.log("Server started on port 3000");
});
