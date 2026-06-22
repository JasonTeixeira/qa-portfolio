---
title: "Terraform Module Patterns: पुन: उपयोग के लिए IaC संरचना कैसे बनाएं"
excerpt: "विवादास्पद Terraform मॉड्यूल पैटर्न — सुसंगत चर नामकरण, आउटपुट अनुबंध, Terratest के साथ परीक्षण, और टीमों में काम करने वाली मॉड्यूल संरचना।"
sourceSlug: terraform-module-patterns-how-i-structure-iac-for-reuse
locale: hi
machineTranslated: true
---

# Terraform Module Patterns: How I Structure IaC for Reuse

AWS Landing Zone और कई इन्फ्रास्ट्रक्चर प्रोजेक्ट्स बनाने के बाद, मैंने इस बारे में राय विकसित की है कि Terraform मॉड्यूल कैसे लिखें जिन्हें अन्य लोग वास्तव में उपयोग कर सकें।

## The Module Structure

हर मॉड्यूल इस संरचना का अनुसरण करता है:

\
