/* eslint max-nested-callbacks: ["error", 4]*/
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { makeMockSource } from "devtools/client/debugger/src/utils/test-mockup";

import {
  createDirectoryNode,
  getRelativePath,
  isExactUrlMatch,
  isDirectory,
  isNotJavaScript,
  getPathWithoutThread,
} from "./utils";
import { addToTree } from "./addToTree";

describe("sources tree", () => {
  describe("isExactUrlMatch", () => {
    it("recognizes root url match", () => {
      const rootA = "http://example.com/path/to/file.html";
      const rootB = "https://www.demo.com/index.html";

      expect(isExactUrlMatch("example.com", rootA)).toBe(true);
      expect(isExactUrlMatch("www.example.com", rootA)).toBe(true);
      expect(isExactUrlMatch("api.example.com", rootA)).toBe(false);
      expect(isExactUrlMatch("example.example.com", rootA)).toBe(false);
      expect(isExactUrlMatch("www.example.example.com", rootA)).toBe(false);
      expect(isExactUrlMatch("demo.com", rootA)).toBe(false);

      expect(isExactUrlMatch("demo.com", rootB)).toBe(true);
      expect(isExactUrlMatch("www.demo.com", rootB)).toBe(true);
      expect(isExactUrlMatch("maps.demo.com", rootB)).toBe(false);
      expect(isExactUrlMatch("demo.demo.com", rootB)).toBe(false);
      expect(isExactUrlMatch("www.demo.demo.com", rootB)).toBe(false);
      expect(isExactUrlMatch("example.com", rootB)).toBe(false);
    });
  });

  // describe("isDirectory", () => {
  //   it("identifies directories correctly", () => {
  //     const sources = [
  //       makeMockSource("http://example.com/a.js", "actor1"),
  //       makeMockSource("http://example.com/b/c/d.js", "actor2"),
  //     ];

  //     const tree = createDirectoryNode("root", "", []);
  //     sources.forEach(source => addToTree(tree, source, "http://example.com/", "Main Thread"));
  //     const [bFolderNode, aFileNode] = tree.contents[0].contents[0].contents;
  //     const [cFolderNode] = bFolderNode.contents;
  //     const [dFileNode] = cFolderNode.contents;

  //     expect(isDirectory(bFolderNode)).toBe(true);
  //     expect(isDirectory(aFileNode)).toBe(false);
  //     expect(isDirectory(cFolderNode)).toBe(true);
  //     expect(isDirectory(dFileNode)).toBe(false);
  //   });
  // });

  describe("getRelativePath", () => {
    it("gets the relative path of the file", () => {
      const relPath = "path/to/file.html";
      expect(getRelativePath("http://example.com/path/to/file.html")).toBe(relPath);
      expect(getRelativePath("http://www.example.com/path/to/file.html")).toBe(relPath);
      expect(getRelativePath("https://www.example.com/path/to/file.js")).toBe("path/to/file.js");
      expect(getRelativePath("webpack:///path/to/file.html")).toBe(relPath);
      expect(getRelativePath("file:///path/to/file.html")).toBe(relPath);
      expect(getRelativePath("file:///path/to/file.html?bla")).toBe(relPath);
      expect(getRelativePath("file:///path/to/file.html#bla")).toBe(relPath);
      expect(getRelativePath("file:///path/to/file")).toBe("path/to/file");
    });
  });

  describe("isNotJavaScript", () => {
    it("js file", () => {
      const source = makeMockSource("http://example.com/foo.js");
      expect(isNotJavaScript(source)).toBe(false);
    });

    it("css file", () => {
      const source = makeMockSource("http://example.com/foo.css");
      expect(isNotJavaScript(source)).toBe(true);
    });

    it("svg file", () => {
      const source = makeMockSource("http://example.com/foo.svg");
      expect(isNotJavaScript(source)).toBe(true);
    });

    it("png file", () => {
      const source = makeMockSource("http://example.com/foo.png");
      expect(isNotJavaScript(source)).toBe(true);
    });
  });

  describe("getPathWithoutThread", () => {
    it("main thread pattern", () => {
      const path = getPathWithoutThread("server1.conn0.child1/context18");
      expect(path).toBe("");
    });

    it("main thread host", () => {
      const path = getPathWithoutThread("server1.conn0.child1/context18/dbg-workers.glitch.me");
      expect(path).toBe("dbg-workers.glitch.me");
    });

    it("main thread children", () => {
      const path = getPathWithoutThread(
        "server1.conn0.child1/context18/dbg-workers.glitch.me/more"
      );
      expect(path).toBe("dbg-workers.glitch.me/more");
    });

    it("worker thread", () => {
      const path = getPathWithoutThread("server1.conn0.child1/workerTarget25/context1");
      expect(path).toBe("");
    });

    it("worker thread with children", () => {
      const path = getPathWithoutThread(
        "server1.conn0.child1/workerTarget25/context1/dbg-workers.glitch.me/utils"
      );
      expect(path).toBe("dbg-workers.glitch.me/utils");
    });

    it("worker thread with file named like pattern", () => {
      const path = getPathWithoutThread(
        "server1.conn0.child1/workerTarget25/context1/dbg-workers.glitch.me/utils/context38/index.js"
      );
      expect(path).toBe("dbg-workers.glitch.me/utils/context38/index.js");
    });
  });
});
