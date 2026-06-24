// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.TINA_BRANCH || process.env.GITHUB_HEAD_REF || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    publicFolder: "public",
    outputFolder: "admin"
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads"
    }
  },
  schema: {
    collections: [
      {
        name: "site",
        label: "Site Content",
        path: "content",
        format: "json",
        match: {
          include: "site"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "string",
            name: "siteTitle",
            label: "Site Title",
            required: true
          },
          {
            type: "string",
            name: "infoLabel",
            label: "Info Toggle Label (closed)",
            required: true
          },
          {
            type: "string",
            name: "onlyWorkLabel",
            label: "Info Toggle Label (open)",
            required: true
          },
          {
            type: "object",
            name: "columnTitles",
            label: "Column Titles",
            fields: [
              { type: "string", name: "shortStories", label: "Short Stories" },
              { type: "string", name: "poems", label: "Poems" },
              { type: "string", name: "interviews", label: "Interviews" },
              { type: "string", name: "biography", label: "Biography" },
              { type: "string", name: "references", label: "References" },
              { type: "string", name: "contact", label: "Contact" }
            ]
          },
          {
            type: "object",
            name: "biography",
            label: "Biography",
            list: true,
            fields: [
              { type: "string", name: "title", label: "Title", required: true },
              {
                type: "string",
                name: "text",
                label: "Text",
                ui: { component: "textarea" },
                required: true
              }
            ]
          },
          {
            type: "object",
            name: "shortStories",
            label: "Short Stories",
            list: true,
            fields: [
              { type: "string", name: "title", label: "Title", required: true },
              {
                type: "string",
                name: "text",
                label: "Text",
                ui: { component: "textarea" },
                description: "Preview is truncated to 400 characters on the site.",
                required: true
              }
            ]
          },
          {
            type: "object",
            name: "poems",
            label: "Poems",
            list: true,
            fields: [
              { type: "string", name: "title", label: "Title", required: true },
              {
                type: "string",
                name: "text",
                label: "Text",
                ui: { component: "textarea" },
                description: "Use line breaks for stanza breaks.",
                required: true
              }
            ]
          },
          {
            type: "object",
            name: "interviews",
            label: "Interview Excerpts",
            list: true,
            fields: [
              { type: "string", name: "title", label: "Title", required: true },
              {
                type: "string",
                name: "text",
                label: "Text",
                ui: { component: "textarea" },
                description: "HTML is supported (e.g. <p>, <strong>).",
                required: true
              }
            ]
          },
          {
            type: "object",
            name: "references",
            label: "References",
            list: true,
            fields: [
              {
                type: "string",
                name: "title",
                label: "Title",
                description: "Citation (name, publication).",
                required: true
              },
              {
                type: "string",
                name: "text",
                label: "Text",
                description: "The quote.",
                ui: { component: "textarea" },
                required: true
              }
            ]
          },
          {
            type: "object",
            name: "contactLinks",
            label: "Contact Links",
            list: true,
            fields: [
              { type: "string", name: "title", label: "Title", required: true },
              {
                type: "string",
                name: "text",
                label: "Text",
                description: "URL (e.g. mailto:, tel:, or https://).",
                required: true
              }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
