//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.set("strictQuery", false);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-eklavya:10.07.2002@cluster0.cmvxcfq.mongodb.net/todolistDB',{useNewUrlParser: true})
// .then( () => console.log("Connection is successful") )
.catch ( (err) => console.log(err) )

const itemsSchema = new mongoose.Schema({
  name:String
})

const Item = mongoose.model("Item",itemsSchema);

const food = new Item ({
  name: "Buy food"
})

const veg = new Item ({
  name: "Buy veg"
})

const milk = new Item ({
  name: "Buy milk"
})

const defaultItems = [food,veg,milk];
const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  Item.find(function(err,item){
    if (item.length === 0) {
      Item.insertMany(defaultItems,function(err){
        if (err) {
        console.log(err);
        } else {
         console.log("success");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: item});
    }

})

});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  // console.log(listName,itemName);

  const item =new Item ({
    name: itemName,
  });

  if (listName==="Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name:listName},function(err,foundList){
      // console.log(foundList.items);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req,res){
  const checkesitemID =req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  // console.log(checkesitemID);

    if (listName==="Today" ) {
    Item.deleteOne({_id:checkesitemID},function(err){
      if (!err) {

        res.redirect("/");
      }
    });
  }
    else {
    //   List.findOneAndUpdate({name:listName},{$pull:({item: {_id:checkesitemID}})}, function(err,foundList){
    //   if (!err) {
    //     console.log("Successfully deleted");
    //     res.redirect("/" + listName);
    //   }
    //   });

      List.findByIdAndUpdate(listName, {$pull: {item: { _id: checkesitemID}}}, function(err,foundList){
      if (!err) {
        console.log("Successfully deleted");
        res.redirect("/" + listName);
      }
      });


      console.log(checkesitemID);
      // List.update({ _id: listName },{$pull: {item: { _id: checkesitemID}}},{ safe: true },function(err, obj) {
      // console.log("Successfully deleted");
      // res.redirect("/" + listName)})

    List.findOneAndDelete({name:listName}, {$pull: {item: { _id: checkesitemID}}}, function(err,foundList){
    if (!err) {
      console.log("Successfully deleted");
      res.redirect("/" + listName);
    }
  });

    }
});


app.get("/:paramname",function(req,res){
  const customListName = _.capitalize(req.params.paramname);

  List.findOne({name:customListName},function(err,results) {
    if (!err) {
      if (results) {
        // console.log(results);
        res.render("list", {listTitle:results.name, newListItems:results.items});
      } else {
        const list = new List ({
          name: customListName,
          items:defaultItems
        })
       list.save();
       res.redirect("/"+ customListName);
      }
    }
    else {
    console.log(err);
    }
  })

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(8000, function() {
  console.log("Server started on port 3000");
});
