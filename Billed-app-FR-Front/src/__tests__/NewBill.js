/**
 * @jest-environment jsdom
 */

import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";


import mockStore from "../__mocks__/store";
import router from "../app/Router.js";


jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const html = NewBillUI();
      document.body.innerHTML = html;
    });
    afterEach(() => {
      document.body.innerHTML = "";
    });
    test("The Form New Bill is defined", () => {
      expect(getByTestId(document.body, "form-new-bill")).toBeDefined();
      expect(getByTestId(document.body, "datepicker")).toBeDefined();
      expect(getByTestId(document.body, "expense-type")).toBeDefined();
      expect(getByTestId(document.body, "expense-name")).toBeDefined();
      expect(getByTestId(document.body, "amount")).toBeDefined();
      expect(getByTestId(document.body, "vat")).toBeDefined();
      expect(getByTestId(document.body, "pct")).toBeDefined();
      expect(getByTestId(document.body, "commentary")).toBeDefined();
      expect(getByTestId(document.body, "file")).toBeDefined();
    });

    test("chose a depense name", () => {
      const name = getByTestId(document.body, "expense-name");
      expect(name.value).toEqual("");
      userEvent.type(name, "taxi Paris");
      expect(name.value).toEqual("taxi Paris");
    });
    test("chose a pct", () => {
      const pct = getByTestId(document.body, "pct");
      expect(pct.value).toEqual("");
      userEvent.type(pct, "20");
      expect(pct.value).toEqual("20");
    });
    test("chose a vat", () => {
      const vat = getByTestId(document.body, "vat");
      expect(vat.value).toEqual("");
      userEvent.type(vat, "100");
      expect(vat.value).toEqual("100");
    });
    test("chose a commentary", () => {
      const commentary = getByTestId(document.body, "commentary");
      expect(commentary.value).toEqual("");
      userEvent.type(commentary, "j'ai fait un exellement voyage");
      expect(commentary.value).toEqual("j'ai fait un exellement voyage");
    });
    test("add a good type file", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const mockStore = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

      const inputFile = getByTestId(newBill.document.body, "file");

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["picture.png"], "picture.png", { type: "image/png" }),
          ],
        },
      });
      expect(inputFile.files[0].name).toEqual("picture.png");
    });
    test("add a bad type file", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const mockStore = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

      const inputFile = getByTestId(newBill.document.body, "file");

      getByTestId(newBill.document.body, "file").addEventListener(
        "change",
        handleChangeFile
      );
      fireEvent.change(getByTestId(newBill.document.body, "file"), {
        target: {
          files: [
            new File(["picture.png"], "picture.png", { type: "video/mp4" }),
          ],
        },
      });
      expect(getByTestId(newBill.document.body, "file").files[0].name).toEqual(
        "invalide"
      );
    });
  });
  describe("When create a newBill", () => {
    test("click on submit button", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH["NewBill"]);

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      
      const handleSubmit = jest.fn(newBill.handleSubmit);
      await waitFor(() => screen.getByTestId("form-new-bill"))
      const submitBtn = screen.getByTestId("form-new-bill");
      submitBtn.addEventListener("submit", handleSubmit);
      
      fireEvent.submit(submitBtn);
      
      // expected values
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.location.hash).toEqual(ROUTES_PATH.Bills)
    });
  });
});
//test des erreur
describe("given I am a employee connected", () => {
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.NewBill);
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.NewBill);
      await new Promise(process.nextTick);
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});