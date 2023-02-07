//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

// main().catch(err => console.log(err));
// async function main() {
//   // await mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");
//   await mongoose.connect("mongodb+srv://ftkovr9k:RagingDemon667@cluster0.znsg1if.mongodb.net/todolistDB");
// }

const connectDB = async () => {
  try{
    const conn = await mongoose.connect("mongodb+srv://ftkovr9k:RagingDemon667@cluster0.znsg1if.mongodb.net/todolistDB");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const itemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("Item", itemSchema);
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const item1 = new Item(
  {
    name: "Welcome!"
  }
);

const item2 = new Item(
  {
    name: "Click the + button to add a new item"
  }
);

const item3 = new Item(
  {
    name: "<--- Hit this to delete an item"
  }
);

const defaultArray = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/:customListName", (req, res) => {
  let customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      if (!results) {
        console.log("Creating New List....");
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultArray
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: results.name, newListItems: results.items });
      }

    }
  });
});


app.get("/", function (req, res) {
  Item.find({}, (err, results) => {
    if (err) {
      console.log(err);
    } else {
      if (results.length === 0) {
        Item.insertMany(defaultArray, err => {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully inserted multiple entries");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: results });
      }
    }
  });

});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }

});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId, err => {
      if (err) {
        console.log(err);
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,results) =>{
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }

});
app.get("*", (req,res)=>{
  res.redirect("/");
});
app.get("/about", function (req, res) {
  res.render("about");
});

connectDB().then(() =>{
  app.listen(PORT, function () {
    console.log("listening for requests")
  });
  
});

