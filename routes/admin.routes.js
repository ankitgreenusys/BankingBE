import express from "express";
import adminController from "../controllers/admin.controllers.js";
import adminauth from "../middlewares/admin.auth.js";

const router = express.Router();

router.post("/login", adminController.login);
router.post("/register", adminController.register);

// ----------------------------------------------Dashboard Details------------------------------------------------ //
router.get("/statsdashboard", adminauth, adminController.getdashboard);
router.get("/userbasedgender", adminauth, adminController.userbasedongender);
router.get("/userbasedjoining", adminauth, adminController.userbasedonjoining);
router.get("/notification", adminauth, adminController.notify);

// ----------------------------------------------User Details------------------------------------------------ //
router.get("/allusers", adminauth, adminController.getalluser);
router.get("/user/:id", adminauth, adminController.getuser);
router.post("/adduser", adminauth, adminController.createuser);
router.post("/verifyotp/:id", adminauth, adminController.verifyuser);
router.post("/sendpwdlink/:id", adminauth, adminController.sendpasslink);
router.post("/setsavingpro/:id", adminauth, adminController.setsavingpro);

// ----------------------------------------------Loan Details------------------------------------------------ //
router.get("/pendingloan", adminauth, adminController.getpendingloan);
router.get("/approvedloan", adminauth, adminController.getapprovedloan);
router.get("/rejectedloan", adminauth, adminController.getrejectedloan);
router.get("/loanbyuser/:id", adminauth, adminController.loanlistbyuser);
router.get("/allloanuser", adminauth, adminController.loanmemberlist);
router.post("/addloan/:userid", adminauth, adminController.createloan);
router.post("/addpayment/:id", adminauth, adminController.addpaymentmethod);
router.get("/approve/:id", adminauth, adminController.approveloan);
router.get("/approve/:id", adminauth, adminController.rejectloan);

// ----------------------------------------------Investment Details------------------------------------------------ //
router.get("/allinvestment", adminauth, adminController.getinvestment);
router.get("/investment/:id", adminauth, adminController.getinvestmentbyuser);

// ----------------------------------------------Transaction Details------------------------------------------------ //
router.get("/gettransaction", adminauth, adminController.gettransaction);

// ----------------------------------------------Customer Support------------------------------------------------ //
router.get("/alltickets", adminauth, adminController.getCustomerSupport);
router.get("/tickets/:id", adminauth, adminController.getCustomerSupportById);
router.post("/pendingtickets", adminauth, adminController.getPendingCustomerSupport);

// ----------------------------------------------Admin Details------------------------------------------------ //
router.get("/mydetails", adminauth, adminController.getadmintrans);

export default router;
