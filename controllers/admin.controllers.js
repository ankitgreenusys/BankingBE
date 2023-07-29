import bcrpyt from "bcryptjs";
import jwt from "jsonwebtoken";
import AdminModel from "../models/admin.model.js";
import LoanModel from "../models/loan.model.js";
import UserModel from "../models/user.model.js";
import TransactionModel from "../models/transaction.model.js";
import InvestmentModel from "../models/investment.model.js";
import NotificationModel from "../models/notification.model.js";
import sendOTP from "../utils/sendOTP.utils.js";
import sendPassword from "../utils/sendPassword.utils.js";
import CustomerSupportModel from "../models/CustomerSupport.model.js";

const routes = {};

routes.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await AdminModel.findOne({ email }).select(
      "email password name balance"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrpyt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const olduser = await AdminModel.findOne({ email });
    if (olduser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrpyt.hash(password, 12);
    const result = await AdminModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: result._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ----------------------------------------------Dashboard Details------------------------------------------------ //

routes.getdashboard = async (req, res) => {
  try {
    const totalmember = await UserModel.countDocuments();
    const allloan = await LoanModel.find();
    let totalloan = 0;
    let totalinterest = 0;
    allloan.forEach((loan) => {
      totalloan += loan.amount;
      let interest = 0,
        rate = loan.interestRate,
        term = loan.term,
        principal = loan.amount;
      if (loan.interest === "Compound Interest") {
        interest = principal * (Math.pow(1 + rate / 100, term) - 1);
      } else {
        interest = (principal * rate * term) / 100;
      }

      totalinterest += interest;
    });
    const allinvestment = await InvestmentModel.find();
    let totalyield = 0;
    allinvestment.forEach((investment) => {
      totalyield += investment.amount;
    });

    res.status(200).json({ totalmember, totalloan, totalinterest, totalyield });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.userbasedongender = async (req, res) => {
  try {
    const result = await UserModel.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.userbasedonjoining = async (req, res) => {
  try {
    // count user joined before a date
    const resuser = await UserModel.find().sort({ joiningDate: 1 });

    const result = [];
    let count = 0;
    let i = 0;
    let date = new Date(resuser[i].joiningDate.split("T")[0]);
    count++;
    result.push({ date, count });

    for (let i = 1; i < resuser.length; i++) {
      date = new Date(resuser[i].joiningDate.split("T")[0]);
      if (date === result[result.length - 1].date) {
        result[result.length - 1].count++;
      } else {
        result.push({ date, count });
      }
    }

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.notify = async (req, res) => {
  try {
    const notifications = await NotificationModel.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ----------------------------------------------User Details------------------------------------------------ //

routes.getalluser = async (req, res) => {
  try {
    const users = await UserModel.find().select(
      "-password -otp -otpExpires -loan -transactions -investment"
    );
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.getuser = async (req, res) => {
  const { id } = req.params;
  try {
    const myuser = await UserModel.findById(id)
      .populate("transactions")
      .select("-password");
    res.status(200).json({ myuser });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.createuser = async (req, res) => {
  const { name, email, mobile, gender, dob } = req.body;
  try {
    console.log("createuser");
    const ifUser = await UserModel.findOne({ email });
    if (ifUser && ifUser.isVerified)
      return res.status(400).json({ error: "User already exists" });

    // unique number
    const uniqueNumberid = await UserModel.find({ mobile: mobile });
    if (uniqueNumberid.length > 0)
      return res.status(400).json({ error: "Mobile number already exists" });

    if (ifUser && !ifUser.isVerified) UserModel.findByIdAndDelete(ifUser._id);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const otpresult = await sendOTP(email, otp, "Verify your email");

    if (!otpresult.messageId)
      return res.status(500).json({ error: "Something went wrong with OTP" });

    const result = await UserModel.create({
      name,
      email,
      mobile,
      gender,
      dob,
      otp,
      otpExpires,
    });

    res
      .status(201)
      .json({ result, success: "OTP has been sent to your email" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.sendpasslink = async (req, res) => {
  const { id } = req.params;
  const { img } = req.body;

  try {
    console.log(img);
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.image = img;
    const result = await user.save();

    const link = `${process.env.Frontend_URL}/resetpassword/${result._id}`;
    const emailresult = await sendPassword(
      result.email,
      link,
      "Reset Password"
    );

    if (!emailresult.messageId)
      return res.status(500).json({ error: "Something went wrong with email" });

    // add notification
    const notification = await NotificationModel.create({
      title: "New User",
      message: `${result.name} has been added by admin`,
    });

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.verifyuser = async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;

  try {
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ error: "OTP expired" });

    if (user.otp != otp) return res.status(400).json({ error: "Invalid OTP" });

    user.isVerified = true;
    const result = await user.save();

    res.status(200).json({ result, success: "Verified" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.setsavingpro = async (req, res) => {
  const { id } = req.params;
  const { savingprofit } = req.body;

  try {
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.savingprofit = savingprofit;

    const result = await user.save();

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ----------------------------------------------Loan Details------------------------------------------------ //

routes.getpendingloan = async (req, res) => {
  try {
    const loans = await LoanModel.find({ status: "Pending" }).populate("user");
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.getapprovedloan = async (req, res) => {
  try {
    const loans = await LoanModel.find({ status: "Approved" }).populate("user");
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.getrejectedloan = async (req, res) => {
  try {
    const loans = await LoanModel.find().populate("user");
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.loanlistbyuser = async (req, res) => {
  const { id } = req.params;

  try {
    const loans = await UserModel.findById(id).populate({
      path: "loan",
      populate: {
        path: "giventransactionId",
        model: "Transaction",
        strictPopulate: false,
      },
    });
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.loanmemberlist = async (req, res) => {
  try {
    const list = await UserModel.find({ isVerified: true }).select("name dob");
    res.status(200).json({ list });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.createloan = async (req, res) => {
  const { userid } = req.params;
  const { amount, term, interest, repaymentterm } = req.body;

  try {
    const user = await UserModel.findOne({ _id: userid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const loan = await LoanModel.create({
      user: userid,
      amount,
      term,
      interest,
      repaymentterm,
      status: "Pending",
    });

    let loanlist = user.loan;
    loanlist.push(loan._id);

    user.loan = loanlist;
    const result = await user.save();

    // add notification
    const notification = await NotificationModel.create({
      title: "New Loan",
      message: `${user.name} has applied for loan`,
    });

    res.status(201).json({ loan });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.addpaymentmethod = async (req, res) => {
  const { id } = req.params;
  const { paymentmethod } = req.body;

  try {
    const loan = await LoanModel.findById(id);
    if (!loan) return res.status(404).json({ error: "Loan not found" });

    loan.paymentmethod = paymentmethod;
    const result = await loan.save();

    // add notification
    const notification = await NotificationModel.create({
      title: "Payment Method Added",
      message: `${result._id}'s payment method has been added`,
    });

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.approveloan = async (req, res) => {
  const { id } = req.params;

  try {
    const loan = await LoanModel.findById(id);
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    loan.status = "Approved";
    const result = await loan.save();

    // add notification
    const notification = await NotificationModel.create({
      title: "Loan Approved",
      message: `${result._id}'s loan has been approved`,
    });

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.rejectloan = async (req, res) => {
  const { id } = req.params;

  try {
    const loan = await LoanModel.findById(id);
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    loan.status = "Rejected";
    const result = await loan.save();

    // add notification
    const notification = await NotificationModel.create({
      title: "Loan Rejected",
      message: `${result._id}'s loan has been rejected`,
    });

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ----------------------------------------------Investment Details------------------------------------------------ //

routes.getinvestment = async (req, res) => {
  try {
    const investments = await InvestmentModel.find().populate("userId");
    res.status(200).json({ investments });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.getinvestmentbyuser = async (req, res) => {
  const { id } = req.params;
  try {
    const investments = await UserModel.findById(id)
      .populate("investment")
      .populate("transactions");
    res.status(200).json({ investments });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ----------------------------------------------Transaction Details------------------------------------------------ //

routes.gettransaction = async (req, res) => {
  try {
    const transactions = await TransactionModel.find().populate("userId");
    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ----------------------------------------------Customer Support------------------------------------------------ //

routes.getCustomerSupport = async (req, res) => {
  try {
    const customerSupport = await CustomerSupportModel.find().populate({
      path: "user",
      select: "name email",
      strictPopulate: false,
    });
    res.status(200).json({ customerSupport });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.getCustomerSupportById = async (req, res) => {
  const { id } = req.params;
  try {
    const customerSupport = await CustomerSupportModel.findById(id).populate({
      path: "user",
      select: "name email",
      strictPopulate: false,
    });
    res.status(200).json({ customerSupport });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

routes.getPendingCustomerSupport = async (req, res) => {
  try {
    const customerSupport = await CustomerSupportModel.find({
      status: "Pending",
    }).populate({
      path: "user",
      select: "name email",
      strictPopulate: false,
    });
    res.status(200).json({ customerSupport });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ----------------------------------------------Admin Details------------------------------------------------ //

routes.getadmintrans = async (req, res) => {
  const id = req.userId;

  try {
    const transactions = await AdminModel.findById(id)
      .select("-password")
      .populate({
        path: "transactions",
        populate: {
          path: "userId",
          model: "User",
          select: "name email",
          strictPopulate: false,
        },
      });
    res.status(200).json({ transactions });

    // const transactions = await transactionmodel.find().populate("userId");
    // res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export default routes;
